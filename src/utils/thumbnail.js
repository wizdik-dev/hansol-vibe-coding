export const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80'

export function handleThumbnailError(e) {
  e.currentTarget.onerror = null
  e.currentTarget.src = DEFAULT_THUMBNAIL
}
