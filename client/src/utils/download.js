async function readBlobMessage(blob) {
  if (!blob) return '';

  const text = await blob.text().catch(() => '');
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.error || text;
  } catch {
    if (/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)) {
      return 'Server returned an HTML receipt instead of PDF. Restart the backend server and try again.';
    }
    return text;
  }
}

export async function downloadApiFile(api, url, fileName, config = {}) {
  let response;
  const separator = url.includes('?') ? '&' : '?';
  const downloadUrl = `${url}${separator}_downloadAt=${Date.now()}`;

  try {
    response = await api.get(downloadUrl, {
      ...config,
      responseType: 'blob',
    });
  } catch (error) {
    const message = await readBlobMessage(error.response?.data);
    throw new Error(message || error.response?.data?.message || error.message || 'Unable to download file');
  }

  if (!response.data || response.data.size === 0) {
    throw new Error('Downloaded file is empty');
  }

  if (fileName.toLowerCase().endsWith('.pdf')) {
    const signatureBuffer = await response.data.slice(0, 5).arrayBuffer();
    const signature = new TextDecoder().decode(signatureBuffer);
    if (signature !== '%PDF-') {
      const message = await readBlobMessage(response.data);
      throw new Error(message || 'Downloaded response is not a PDF');
    }
  }

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}
