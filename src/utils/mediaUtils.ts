
/**
 * Utility functions for media handling
 */

/**
 * Process audio URL to ensure it's playable
 * @param url URL of the audio file
 * @returns Processed URL ready for playback
 */
export const getPlayableAudioUrl = (url: string | undefined): string => {
  if (!url) return '';
  
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (fileIdMatch && fileIdMatch[0]) {
      const fileId = fileIdMatch[0];
      console.log('Extracted Google Drive file ID:', fileId);
      
      // For preview (streaming)
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
};

/**
 * Process image URL to ensure it's displayable
 * @param url URL of the image file
 * @returns Processed URL ready for display
 */
export const getDisplayableImageUrl = (url: string | undefined): string => {
  if (!url) return '/placeholder.svg';
  
  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (fileIdMatch && fileIdMatch[0]) {
      const fileId = fileIdMatch[0];
      console.log('Extracted Google Drive image ID:', fileId);
      // Use a more reliable way to access Google Drive images
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
};

/**
 * Get direct download link for Google Drive file
 * @param fileId Google Drive file ID
 * @returns Direct download URL
 */
export const getGoogleDriveDownloadLink = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Check if media is loading or has errors
 * @param url URL of the media file
 * @param type Type of media ('audio' or 'image')
 * @returns Promise that resolves with success status
 */
export const checkMediaStatus = (url: string, type: 'audio' | 'image'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    if (type === 'audio') {
      const audio = new Audio();
      audio.onloadedmetadata = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.src = getPlayableAudioUrl(url);
    } else {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = getDisplayableImageUrl(url);
    }
  });
};
