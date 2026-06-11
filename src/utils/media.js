/**
 * utils/media.js
 *
 * Helpers for normalising media / file URLs that come from the backend.
 * The Laravel backend stores files under /storage/… and returns either:
 *   - a full URL  (https://cofound.dpdns.org/storage/…)
 *   - a relative path  (/storage/…  or  storage/…)
 *   - null / undefined when no file has been uploaded yet
 *
 * normalizeMediaUrl  – turns any of the above into a usable <img src> value.
 * normalizeProfileMedia – runs normalizeMediaUrl on every known media field
 *                         of a user / profile object and returns the result.
 */

const STORAGE_BASE = 'https://cofound.dpdns.org'

/**
 * Resolve a single media value to an absolute URL (or null).
 *
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export function normalizeMediaUrl(value) {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // Already absolute
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Relative path – prepend the storage base
  const separator = trimmed.startsWith('/') ? '' : '/'
  return `${STORAGE_BASE}${separator}${trimmed}`
}

/**
 * Return a shallow copy of a user / profile object with all known media
 * fields resolved to absolute URLs.
 *
 * @param {object|null|undefined} profile
 * @returns {object|null}
 */
export function normalizeProfileMedia(profile) {
  if (!profile || typeof profile !== 'object') return profile ?? null

  const MEDIA_FIELDS = [
    'avatar',
    'avatar_url',
    'profile_picture',
    'profile_picture_url',
    'cover_photo',
    'cover_photo_url',
    'cover_image',
    'cover_image_url',
    'photo',
    'photo_url',
    'image',
    'image_url',
  ]

  const normalized = { ...profile }

  for (const field of MEDIA_FIELDS) {
    if (field in normalized) {
      normalized[field] = normalizeMediaUrl(normalized[field])
    }
  }

  return normalized
}
