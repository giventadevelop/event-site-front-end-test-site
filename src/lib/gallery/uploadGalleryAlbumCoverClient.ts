/**
 * Client-side upload for gallery album cover images (multipart → Next.js proxy).
 * Backend persists gallery_album.cover_image_url on success.
 */
export async function uploadGalleryAlbumCoverFile(albumId: number, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Unsupported file type. Please upload a JPEG, PNG, or GIF image.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size is too large. Please upload an image smaller than 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({
    albumId: String(albumId),
    title: 'Gallery Album Cover Image',
    description: 'Cover image for gallery album',
    isPublic: 'true',
  });

  const response = await fetch(
    `/api/proxy/event-medias/upload/gallery-album-cover-image?${params.toString()}`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    let errorMessage = 'Failed to upload gallery album cover image';
    try {
      const responseText = await response.text();
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (responseText.trim()) {
        errorMessage = responseText.trim();
      }
    } catch {
      // use default message
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  const imageUrl = result.fileUrl || result.url || result.imageUrl;

  if (!imageUrl) {
    throw new Error('Upload succeeded but no image URL returned');
  }

  return imageUrl;
}
