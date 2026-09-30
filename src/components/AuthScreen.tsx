import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Scale,
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  UserCheck,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    signInWithCredentials,
    signUp,
    signIn,
    signInAsNewUserDemo,
    signInAsExistingUserDemo,
  } = useLegal();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('In-House Legal Counsel');
  const [department, setDepartment] = useState('Corporate Legal Operations');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your corporate email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithCredentials(email.trim(), password);
    } catch (err: any) {
      console.error(err);
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password'
      ) {
        setErrorMsg('Invalid email or password. Please verify your credentials or create a new account.');
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err?.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your corporate email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim(), role, department);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in or use another email.');
      } else if (err?.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email format.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMsg('Password is too weak. Please use at least 6 characters.');
      } else {
        setErrorMsg(err?.message || 'Account registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signIn();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to connect to Google Single Sign-On.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#000000] relative flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black font-sans overflow-hidden">
      {/* Subtle Black/Charcoal Ambient Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none opacity-50" />

      {/* Brand Header */}
      <div className="w-full max-w-md mb-5 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 shadow-sm mb-3">
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-black">
            <Scale className="w-2.5 h-2.5 stroke-[2.8]" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-neutral-300 uppercase">
            In-House Legal Operations
          </span>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono border border-neutral-700">
            Secure OS
          </span>
        </div>

        <h1 className="text-[23px] sm:text-[25px] font-black text-white tracking-tight">
          In-House Operation System Tracker
        </h1>
        <p className="text-[12.5px] text-neutral-400 mt-1">
          Corporate Counsel Portal &bull; Isolated Database
        </p>
      </div>

      {/* Main Auth Box - Noticeably lighter charcoal tone (#1c1d22) distinct from pure black background */}
      <div className="w-full max-w-md bg-[#1c1d22] border border-neutral-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden relative z-10">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#141418] border-b border-neutral-700/80 text-[12.5px]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer text-center font-bold ${
              mode === 'signin'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer text-center font-bold flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="p-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-neutral-900 border border-red-500/60 text-red-300 text-[12px] flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-neutral-300 mb-1">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. counsel@company.com"
                    className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-medium text-neutral-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-9 pr-10 py-2.5 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-bold text-[13px] rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Tracker</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700/80" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-[#1c1d22] px-2 text-neutral-400 font-medium tracking-wider">
                    Or Continue With
                  </span>
                </div>
              </div>

              {/* Google Workspace SSO Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2 px-3 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-neutral-200 font-medium text-[12.5px] rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer bg-[#141418]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google Workspace (Single Sign-On)</span>
              </button>

              {/* Quick Demo Access Options - Clearly distinguishing Existing User vs New User Blank */}
              <div className="pt-2 space-y-2">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Test Workspace Demos
                </div>

                {/* Existing User Demo (Has Full Data) */}
                <button
                  type="button"
                  onClick={signInAsExistingUserDemo}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#27272e] hover:bg-[#32323a] border border-neutral-600 hover:border-neutral-400 text-white text-[12px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Existing User Demo (Has Existing Data)</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded font-mono border border-emerald-700/60">
                    Full Data
                  </span>
                </button>

                {/* New User Demo (100% Blank Data) */}
                <button
                  type="button"
                  onClick={signInAsNewUserDemo}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#27272e] hover:bg-[#32323a] border border-neutral-600 hover:border-neutral-400 text-white text-[12px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>New User Demo (Blank Data)</span>
                  </div>
                  <span className="text-[10px] text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded font-mono flex items-center gap-1 border border-sky-700/60">
                    <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                    <span>Clean / Blank</span>
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Info Notice about Isolated Blank Tracker */}
              <div className="p-3 rounded-lg bg-[#141418] border border-neutral-700 text-neutral-200 text-[11.5px] leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Clean Personal Workspace:</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    Every new account starts with an isolated, blank personal tracker. You can begin logging your agreements immediately, or click the sample loader to explore with demo data.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-300 mb-1">
                  Full Name <span className="text-neutral-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-300 mb-1">
                  Corporate Email Address <span className="text-neutral-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="counsel@company.com"
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-300 mb-1">
                    Role / Title
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-2 text-[12px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white bg-[#0f1013] text-white"
                  >
                    <option value="In-House Legal Counsel">In-House Legal Counsel</option>
                    <option value="Senior Legal Counsel">Senior Legal Counsel</option>
                    <option value="Legal Operations Specialist">Legal Operations Specialist</option>
                    <option value="IP & Trademark Specialist">IP &amp; Trademark Specialist</option>
                    <option value="Conveyancing Legal Counsel">Conveyancing Legal Counsel</option>
                    <option value="Litigation Manager">Litigation Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-neutral-300 mb-1">
                    Department / Unit
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Legal Operations"
                    className="w-full px-2 py-2 text-[12px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white bg-[#0f1013] text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-300 mb-1">
                  Password (Min. 6 Characters) <span className="text-neutral-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-10 py-2 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-300 mb-1">
                  Confirm Password <span className="text-neutral-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 text-[13px] border border-neutral-700 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white bg-[#0f1013] text-white placeholder-neutral-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-bold text-[13px] rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Create Account &amp; Open My Tracker</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-6 py-3 bg-[#141418] border-t border-neutral-700/80 text-center">
          <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>Encrypted Firestore Database &bull; Isolated per User ID</span>
          </p>
        </div>
      </div>
    </div>
  );
};
