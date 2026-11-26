const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const ALLOWED_HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const SAFE_DATA_IMAGE_RE =
  /^data:image\/(webp|jpeg|jpg|png);base64,[A-Za-z0-9+/=]+$/i;

/**
 * Sanitizes external or contact links, permitting only http:, https:, and mailto: schemes.
 * Returns an empty string for unsafe or malformed URLs (e.g., javascript:, data:, vbscript:).
 */
export function sanitizeUrl(raw: string | undefined | null): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';

  // Reject protocol-relative or whitespace-obfuscated schemes
  if (value.startsWith('//')) return '';
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '');

  try {
    const parsed = new URL(cleaned);
    if (!ALLOWED_LINK_PROTOCOLS.has(parsed.protocol)) {
      return '';
    }
    if (parsed.protocol === 'mailto:') {
      return parsed.pathname.includes('@') ? `mailto:${parsed.pathname}` : '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Validates whether a non-empty string is a safe http/https/mailto URL.
 */
export function isSafeLinkOrEmpty(raw: string | undefined | null): boolean {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return true;
  return sanitizeUrl(trimmed) !== '';
}

/**
 * Sanitizes avatar image sources, allowing only local WebP/JPEG/PNG base64 data URLs
 * (explicitly blocking SVG data URLs) or safe http/https URLs.
 */
export function sanitizeAvatarSrc(raw: string | undefined | null): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (SAFE_DATA_IMAGE_RE.test(value)) {
    return value;
  }
  try {
    const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '');
    const parsed = new URL(cleaned);
    if (ALLOWED_HTTP_PROTOCOLS.has(parsed.protocol)) {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Escapes HTML special characters for safe interpolation inside exported HTML strings.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes a user-provided name for safe download filenames.
 */
export function sanitizeFilenamePart(value: string | undefined | null): string {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9\-_]/g, '')
    .slice(0, 40);
  return normalized || 'basma-profile';
}
