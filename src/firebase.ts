import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// All Google Drive scopes configured via OAuth
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

export const googleProvider = new GoogleAuthProvider();
SCOPES.forEach((scope) => googleProvider.addScope(scope));

// Prompt account selection so multiple users can sign in, switch accounts, or use different Google IDs
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AppUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  lastLogin: string;
}

// In-memory token cache (DO NOT store in localStorage/sessionStorage as mandated by skill)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear cached token on sign-out
onAuthStateChanged(auth, (user) => {
  if (!user && !isSigningIn) {
    cachedAccessToken = null;
  }
});

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export async function signInWithGoogle(): Promise<{ user: User; accessToken: string | null }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    // Automatically sync / register user profile into Firebase for multi-user management
    if (result.user) {
      const userProfile: AppUserProfile = {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Legal Counsel',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        role:
          result.user.email === 'elisa.zahari@mediaprima.com.my'
            ? 'Lead Legal Counsel (Admin)'
            : 'In-House Legal Counsel',
        lastLogin: new Date().toISOString(),
      };

      setDoc(doc(db, 'users', result.user.uid), userProfile, { merge: true }).catch((err) => {
        console.warn('Could not save user profile to Firestore:', err);
      });
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function signOutUser() {
  await signOut(auth);
  cachedAccessToken = null;
}

// Save any Google Drive or document link to Firebase Firestore
export async function saveLinkToFirebase(linkData: {
  id: string;
  name: string;
  url: string;
  category: string;
  matterId?: string;
  matterType?: string;
  sizeFormatted?: string;
}) {
  const user = auth.currentUser;
  const payload = {
    ...linkData,
    uploadedBy: user?.displayName || user?.email || 'In-House Legal Counsel',
    uploadedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'links', linkData.id), payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `links/${linkData.id}`);
    throw error;
  }
}

// Validate connection to Firestore as mandated by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
