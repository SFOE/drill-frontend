/**
 * Safely strips HTML tags from a string using DOMParser.
 * Avoids innerHTML-based XSS vectors from untrusted API responses.
 */
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s?#\s?/g, ' ').trim()
}
