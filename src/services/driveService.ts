import { getCachedAccessToken } from '../firebase';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

export async function listDriveFiles(searchTerm = ''): Promise<DriveFileItem[]> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in with Google.');
  }

  let query = 'trashed = false';
  if (searchTerm.trim()) {
    const escaped = searchTerm.replace(/'/g, "\\'");
    query += ` and name contains '${escaped}'`;
  }

  const fields = 'files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink)';
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=${encodeURIComponent(
    fields
  )}&q=${encodeURIComponent(query)}&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch files from Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Uploads a text or PDF/JSON report to the user's Google Drive.
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFileItem> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in with Google.');
  }

  const metadata = {
    name: fileName,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to upload file to Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Deletes a file from Google Drive with mandatory confirmation requirement.
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in with Google.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file from Google Drive (${res.status})`);
  }
}

/**
 * Downloads a file directly from Google Drive using the OAuth access token.
 */
export async function downloadDriveFile(fileId: string, fileName: string): Promise<void> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in with Google.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    // If it's a native Google Doc / Sheet (which cannot be downloaded with alt=media directly)
    if (res.status === 403 || res.status === 400) {
      window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
      return;
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to download file from Google Drive (${res.status})`);
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

