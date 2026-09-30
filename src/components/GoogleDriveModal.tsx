import React, { useState, useEffect } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  listDriveFiles,
  uploadFileToDrive,
  deleteDriveFile,
  downloadDriveFile,
  DriveFileItem,
} from '../services/driveService';
import { getCachedAccessToken } from '../firebase';
import {
  X,
  Search,
  FileText,
  FileCheck,
  ExternalLink,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  HardDrive,
  File,
} from 'lucide-react';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachFile?: (file: { name: string; url?: string; id: string; size?: string }) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onAttachFile,
}) => {
  const { user, signIn, selectedMatter, agreements, lods, properties, ips } = useLegal();

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Destructive confirmation dialog state (Mandatory by Workspace Skill)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasAccessToken = !!getCachedAccessToken();

  const fetchFiles = async (query = searchTerm) => {
    if (!hasAccessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles(query);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Drive fetch error:', err);
      setError(err.message || 'Failed to load files from Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasAccessToken) {
      fetchFiles();
    }
  }, [isOpen, hasAccessToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(searchTerm);
  };

  const handleUploadCurrentMatter = async () => {
    if (!selectedMatter) {
      setError('Please select a legal matter first to export to Google Drive.');
      return;
    }

    let matterTitle = '';
    let matterSummary = '';
    const now = new Date().toISOString();

    if (selectedMatter.type === 'lod') {
      const item = lods.find((l) => l.id === selectedMatter.id);
      if (item) {
        matterTitle = `LOD_Brief_${item.id}_${item.claimantName.replace(/\s+/g, '_')}.txt`;
        matterSummary = `LEXOPS COUNSEL OS - LEGAL LETTER OF DEMAND BRIEF\n` +
          `============================================================\n` +
          `Matter ID: ${item.id}\n` +
          `Title: ${item.title}\n` +
          `Claimant: ${item.claimantName}\n` +
          `Adverse Firm: ${item.adverseCounsel}\n` +
          `Appointed Defense Counsel: ${item.appointedLitigationFirm}\n` +
          `Statutory Response Deadline: ${item.responseDeadlineDate}\n` +
          `Stage: ${item.stage}\n` +
          `Financial Exposure: MYR ${item.claimAmount.toLocaleString()}\n` +
          `Exported At: ${now}\n` +
          `Summary Notes:\n${item.responseNotes || item.briefClaimSummary || 'No notes logged.'}\n`;
      }
    } else if (selectedMatter.type === 'agreement') {
      const item = agreements.find((a) => a.id === selectedMatter.id);
      if (item) {
        matterTitle = `Agreement_Brief_${item.id}_${item.counterpartyName.replace(/\s+/g, '_')}.txt`;
        matterSummary = `LEXOPS COUNSEL OS - COMMERCIAL AGREEMENT RECORD\n` +
          `============================================================\n` +
          `Matter ID: ${item.id}\n` +
          `Title: ${item.title}\n` +
          `Counterparty: ${item.counterpartyName}\n` +
          `Department: ${item.stakeholderDepartment} (${item.stakeholderName})\n` +
          `Stage: ${item.stage}\n` +
          `Requisition Date: ${item.requestDate}\n` +
          `Expiry / Renewal Target: ${item.expectedExpiryDate}\n` +
          `Turnaround Time (TAT): ${item.tatDaysElapsed} Days\n` +
          `Assigned Counsel: ${item.assignedCounsel}\n` +
          `Exported At: ${now}\n` +
          `Attorney Notes:\n${item.notes || item.remarks || 'No notes.'}\n`;
      }
    } else if (selectedMatter.type === 'property') {
      const item = properties.find((p) => p.id === selectedMatter.id);
      if (item) {
        matterTitle = `Property_Brief_${item.id}_${item.propertyName.replace(/\s+/g, '_')}.txt`;
        matterSummary = `LEXOPS COUNSEL OS - REAL ESTATE CONVEYANCING BRIEF\n` +
          `============================================================\n` +
          `Property ID: ${item.id}\n` +
          `Property: ${item.propertyName}\n` +
          `Address: ${item.propertyAddress}\n` +
          `Transaction: ${item.transactionType}\n` +
          `Counterparty: ${item.counterparty}\n` +
          `External Law Firm: ${item.externalLawFirm}\n` +
          `Completion Target: ${item.targetCompletionDate}\n` +
          `Stage: ${item.stage}\n` +
          `Exported At: ${now}\n`;
      }
    } else if (selectedMatter.type === 'ip') {
      const item = ips.find((i) => i.id === selectedMatter.id);
      if (item) {
        matterTitle = `IP_Docket_${item.id}_${item.trademarkName.replace(/\s+/g, '_')}.txt`;
        matterSummary = `LEXOPS COUNSEL OS - INTELLECTUAL PROPERTY RECORD\n` +
          `============================================================\n` +
          `Asset ID: ${item.id}\n` +
          `Mark / Patent: ${item.trademarkName}\n` +
          `Registration No: ${item.registrationNumber}\n` +
          `Classification: ${item.niceClass}\n` +
          `Status: ${item.status}\n` +
          `Renewal Expiry: ${item.expiryRenewalDate}\n` +
          `Exported At: ${now}\n`;
      }
    }

    if (!matterTitle) {
      matterTitle = `Legal_Matter_Brief_${selectedMatter.id}.txt`;
      matterSummary = `Legal Matter ${selectedMatter.id} exported at ${now}`;
    }

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const uploaded = await uploadFileToDrive(matterTitle, matterSummary, 'text/plain');
      setUploadSuccess(`Successfully uploaded "${uploaded.name}" to Google Drive!`);
      await fetchFiles();
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload matter brief to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span>Google Drive Legal File Repository</span>
                {user && (
                  <span className="text-[11px] font-normal text-slate-500">
                    ({user.email})
                  </span>
                )}
              </h2>
              <p className="text-[11.5px] text-slate-500">
                Browse, attach, and backup corporate contracts, court pleadings & deeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!hasAccessToken ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-semibold text-slate-900">
                Google Drive Authorization Required
              </h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">
                Connect your Google Account to access confidential legal files, attach contracts directly to matters, and export case briefs to Google Drive.
              </p>
            </div>

            {/* Official GSI Google Sign-In Button */}
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Authorize with Google Account</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search files in Google Drive (e.g. Agreement, Tenancy, NDAs)..."
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </form>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchFiles(searchTerm)}
                  disabled={isLoading}
                  title="Refresh Google Drive files"
                  className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleUploadCurrentMatter}
                  disabled={isUploading || !selectedMatter}
                  title={selectedMatter ? `Export ${selectedMatter.id} brief to Google Drive` : 'Select a matter to export'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Backup Matter to Drive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Notification messages */}
            {uploadSuccess && (
              <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {error && (
              <div className="mx-4 mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[12px] font-medium flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Files List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-[12.5px]">Accessing Google Drive files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-1">
                  <File className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
                  <p className="text-[13px] font-medium text-slate-700">No matching files found in Google Drive</p>
                  <p className="text-[11.5px] text-slate-400">Try adjusting your search query or uploading a file.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {files.map((file) => {
                    const isPdf = file.mimeType?.includes('pdf');
                    const isDoc = file.mimeType?.includes('word') || file.mimeType?.includes('document');
                    const isSheet = file.mimeType?.includes('spreadsheet') || file.mimeType?.includes('excel');

                    return (
                      <div
                        key={file.id}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isPdf
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : isDoc
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : isSheet
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[12.5px] font-semibold text-slate-900 truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>
                                {file.size
                                  ? `${(Number(file.size) / (1024 * 1024)).toFixed(2)} MB`
                                  : 'Google Workspace Doc'}
                              </span>
                              <span>&bull;</span>
                              <span>
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleDateString()
                                  : 'Recent'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onAttachFile && (
                            <button
                              onClick={() => {
                                onAttachFile({
                                  id: file.id,
                                  name: file.name,
                                  url: file.webViewLink,
                                  size: file.size
                                    ? `${(Number(file.size) / (1024 * 1024)).toFixed(2)} MB`
                                    : 'Drive Doc',
                                });
                                onClose();
                              }}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              Attach to Matter
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => downloadDriveFile(file.id, file.name)}
                            className="p-1.5 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title={`Download "${file.name}" to computer`}
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11.5px] text-slate-500">
          <span>
            {files.length} {files.length === 1 ? 'file' : 'files'} accessible via Google Drive
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 p-5 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Delete File from Google Drive?
                </h3>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-slate-900">"{fileToDelete.name}"</span>?
                  This action cannot be undone on Google Drive.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 text-[12px] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
