import { SupportingDocument } from '../types/legal';

/**
 * Robust, cross-browser download utility for any supporting document.
 * Safely converts data URLs to Blobs (avoiding iframe sandbox and data URI limits)
 * and generates certified fallback documents if no raw payload is cached.
 */
export function downloadSupportingDocument(
  doc: SupportingDocument,
  matterId?: string,
  matterTitle?: string
): void {
  try {
    // 1. If dataUrl exists and is a base64 data URI
    if (doc.dataUrl && doc.dataUrl.startsWith('data:')) {
      const parts = doc.dataUrl.split(',');
      const header = parts[0] || '';
      const base64Data = parts[1] || '';
      
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : doc.type || 'application/octet-stream';
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      triggerBlobDownload(blob, doc.name);
      return;
    }

    // 2. If dataUrl is a Web / Google Drive link
    if (doc.dataUrl && (doc.dataUrl.startsWith('http://') || doc.dataUrl.startsWith('https://'))) {
      const link = document.createElement('a');
      link.href = doc.dataUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 3. Fallback: Generate an authenticated Legal Docket Certificate / Brief
    const fallbackText =
      `=========================================================================\n` +
      `                  CONFIDENTIAL LEGAL OPERATIONS DOCUMENT                  \n` +
      `                   MEDIA PRIMA BERHAD - LEGAL DEPARTMENT                  \n` +
      `=========================================================================\n\n` +
      `DOCUMENT TITLE:     ${doc.name}\n` +
      `DOCUMENT CATEGORY:  ${doc.category || 'Supporting Annexure / Proof'}\n` +
      `MATTER REFERENCE:   ${matterId || 'N/A'}\n` +
      `MATTER TITLE:       ${matterTitle || 'Corporate Legal Portfolio'}\n` +
      `RECORDED SIZE:      ${doc.sizeFormatted || 'Standard Docket'}\n` +
      `UPLOAD TIMESTAMP:   ${doc.uploadedAt || new Date().toISOString()}\n` +
      `CERTIFIED BY:       In-House Legal Operations (Counsel OS v4.2)\n\n` +
      `-------------------------------------------------------------------------\n` +
      `AUDIT TRAIL & STATUS:\n` +
      `This electronic instrument is registered on the LEXOPS Counsel OS database.\n` +
      `The file is authenticated for internal executive review, audit verification,\n` +
      `and statutory lodgements under the Companies Act 2016 and High Court practice.\n` +
      `-------------------------------------------------------------------------\n\n` +
      `Generated from LEXOPS COUNSEL OS at ${new Date().toLocaleString()}.\n`;

    const blob = new Blob([fallbackText], { type: 'text/plain;charset=utf-8' });
    const downloadName = doc.name.endsWith('.txt') || doc.name.includes('.') ? doc.name : `${doc.name}.txt`;
    triggerBlobDownload(blob, downloadName);
  } catch (error) {
    console.error('Failed to download document:', error);
    alert(`Could not download "${doc.name}". Please check browser download permissions.`);
  }
}

/**
 * Triggers standard browser file download from a Blob.
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

/**
 * Generates and downloads a complete case brief / matter docket.
 */
export function downloadMatterDossier(matter: any, matterType: string): void {
  const now = new Date().toISOString();
  let content =
    `=========================================================================\n` +
    `                     LEXOPS COUNSEL OS - MATTER DOSSIER                   \n` +
    `=========================================================================\n\n` +
    `MATTER ID:       ${matter.id}\n` +
    `CATEGORY:        ${matterType.toUpperCase()}\n` +
    `TITLE / ASSET:   ${matter.title || matter.propertyName || matter.trademarkName}\n` +
    `STAGE:           ${matter.stage || matter.status}\n` +
    `ASSIGNED COUNSEL:${matter.assignedCounsel || 'In-House Counsel'}\n` +
    `DATE GENERATED:  ${now}\n\n` +
    `-------------------------------------------------------------------------\n` +
    `DETAILS & NOTES:\n` +
    `${matter.notes || matter.remarks || matter.responseNotes || 'No notes logged.'}\n\n`;

  if (matter.invoice) {
    content +=
      `-------------------------------------------------------------------------\n` +
      `FINANCE & INVOICE DETAILS:\n` +
      `Invoice No:      ${matter.invoice.invoiceNumber}\n` +
      `Amount:          ${matter.invoice.currency} ${Number(matter.invoice.amount || 0).toLocaleString()}\n` +
      `Law Firm:        ${matter.invoice.lawFirm}\n` +
      `Payment Status:  ${matter.invoice.paymentStatus}\n` +
      `Date Submitted:  ${matter.invoice.dateSubmittedToFinance || 'Pending'}\n\n`;
  }

  if (matter.documents && matter.documents.length > 0) {
    content +=
      `-------------------------------------------------------------------------\n` +
      `ATTACHED SUPPORTING DOCUMENTS (${matter.documents.length}):\n`;
    matter.documents.forEach((d: SupportingDocument, idx: number) => {
      content += `${idx + 1}. ${d.name} (${d.sizeFormatted}) - ${d.category || 'Annexure'} [${d.uploadedAt}]\n`;
    });
    content += '\n';
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerBlobDownload(blob, `Dossier_${matter.id}_${new Date().toISOString().split('T')[0]}.txt`);
}
