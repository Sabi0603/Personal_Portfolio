/**
 * Utility to reliably download a file with a guaranteed custom filename and MIME type.
 * Works around modern browser cross-origin limitations on the HTML `download` attribute
 * by fetching the asset as a typed Blob and creating a same-origin blob: URL.
 *
 * @param {string} url - Target URL of the file to download (Cloudinary URL or API endpoint)
 * @param {string} fileName - Desired download filename (e.g. 'Sabari-M-Resume.pdf')
 * @param {string} mimeType - MIME type for the Blob (default 'application/pdf')
 */
export async function downloadFileFromUrl(
  url,
  fileName = 'Sabari-M-Resume.pdf',
  mimeType = 'application/pdf'
) {
  if (!url) return;

  const finalFileName = fileName.toLowerCase().endsWith('.pdf')
    ? fileName
    : `${fileName}.pdf`;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    // Ensure blob is typed correctly
    const typedBlob = new Blob([blob], { type: mimeType });
    const blobUrl = window.URL.createObjectURL(typedBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up temporary DOM element and object URL
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch (err) {
    console.warn(
      '[downloadHelper] Direct blob download failed, falling back to backend download route or direct link:',
      err
    );
    // Fallback: Trigger download via direct link
    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.download = finalFileName;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    setTimeout(() => {
      if (document.body.contains(fallbackLink)) {
        document.body.removeChild(fallbackLink);
      }
    }, 200);
  }
}

