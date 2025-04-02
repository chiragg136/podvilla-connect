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
  
  console.log('Processing audio URL:', url);
  
  // For Supabase storage URLs, check if it needs any adjustments
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    console.log('Using Supabase storage URL:', url);
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
  
  // Handle data URLs (for local testing/development)
  if (url.startsWith('data:audio/')) {
    console.log('Using data URL for audio');
    return url;
  }
  
  // For relative URLs, ensure they have the correct base path
  if (url.startsWith('/')) {
    const basePath = window.location.origin;
    console.log('Converting relative URL to absolute:', `${basePath}${url}`);
    return `${basePath}${url}`;
  }
  
  console.log('Using original URL:', url);
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
  
  // Handle data URLs
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  // For relative URLs, ensure they have the correct base path
  if (url.startsWith('/')) {
    const basePath = window.location.origin;
    return `${basePath}${url}`;
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

/**
 * Check if user is authenticated with Supabase
 * @returns Promise that resolves to a boolean indicating if user is authenticated
 */
export const checkSupabaseAuth = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

/**
 * Get the current authenticated user ID from Supabase
 * @returns Promise that resolves to the user ID or null if not authenticated
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Verify if an audio URL is playable by trying to load it
 * @param url URL of the audio file to test
 * @returns Promise that resolves with a boolean indicating if the audio is playable
 */
export const isAudioPlayable = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    let timeoutId: number;
    
    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      audio.removeEventListener('canplaythrough', onSuccess);
      audio.removeEventListener('error', onError);
      audio.src = '';
      audio.load();
    };
    
    const onSuccess = () => {
      console.log('Audio is playable:', url);
      cleanup();
      resolve(true);
    };
    
    const onError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      cleanup();
      resolve(false);
    };
    
    timeoutId = window.setTimeout(() => {
      console.warn('Audio load timeout:', url);
      cleanup();
      resolve(false);
    }, 8000);
    
    audio.addEventListener('canplaythrough', onSuccess);
    audio.addEventListener('error', onError);
    
    // Process the URL first to ensure it's in a playable format
    const processedUrl = getPlayableAudioUrl(url);
    console.log('Testing audio playability:', processedUrl);
    audio.src = processedUrl;
    audio.load();
  });
};
