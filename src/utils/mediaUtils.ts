
import { supabase } from "@/integrations/supabase/client";

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
  
  // For Supabase storage URLs, return as is
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    return url;
  }
  
  // Handle Google Drive links (legacy support)
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (fileIdMatch && fileIdMatch[0]) {
      const fileId = fileIdMatch[0];
      console.log('Extracted Google Drive file ID:', fileId);
      
      // Use a more reliable streaming URL format
      // The 'export=view' parameter works better for streaming media
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
  
  // For Supabase storage URLs, return as is
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    return url;
  }
  
  // Handle Google Drive links (legacy support)
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (fileIdMatch && fileIdMatch[0]) {
      const fileId = fileIdMatch[0];
      console.log('Extracted Google Drive image ID:', fileId);
      
      // Use a direct media URL format that's more reliable for images
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  
  return url;
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

/**
 * Get file extension from filename or URL
 * @param filename Filename or URL
 * @returns File extension without the dot
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Generate a safe filename for storage
 * @param originalName Original filename
 * @returns Safe filename
 */
export const getSafeFilename = (originalName: string): string => {
  // Replace spaces with underscores and remove special characters
  return originalName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '');
};

/**
 * Get a download link for Google Drive files (legacy support)
 * @param fileId Google Drive file ID
 * @returns Direct download URL
 */
export const getGoogleDriveDownloadLink = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};
