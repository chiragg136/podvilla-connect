import { supabase } from "@/integrations/supabase/client";
import { isS3PresignedUrl, refreshS3Url } from "./awsS3Utils";

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
  
  // Check if the URL is a data URL from localStorage
  if (url.startsWith('data:audio/') || url.startsWith('blob:')) {
    console.log('Using data/blob URL for audio');
    return url;
  }
  
  // Handle local file URLs that start with "localfile:"
  if (url.startsWith('localfile:')) {
    try {
      // Try to get the actual data URL from localStorage
      const fileKey = url.replace('localfile:', '');
      const audioData = localStorage.getItem(`audio_${fileKey}`);
      if (audioData) {
        console.log('Found local audio data');
        return audioData;
      } else {
        console.warn('Local audio data not found for key:', fileKey);
        return '';
      }
    } catch (e) {
      console.error('Error retrieving local audio:', e);
      return '';
    }
  }
  
  // For AWS S3 presigned URLs
  if (isS3PresignedUrl(url)) {
    console.log('Using AWS S3 presigned URL:', url);
    try {
      // Try to get the actual data URL from localStorage
      const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
      if (urlMappings[url]) {
        console.log('Found cached data URL for S3 URL');
        return urlMappings[url];
      }
    } catch (e) {
      console.error('Error retrieving cached data URL:', e);
    }
    return url;
  }
  
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
  
  // For relative URLs, ensure they have the correct base path
  if (url.startsWith('/')) {
    const basePath = window.location.origin;
    console.log('Converting relative URL to absolute:', `${basePath}${url}`);
    return `${basePath}${url}`;
  }
  
  // Check if there's a cached version in localStorage
  try {
    const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    if (urlMappings[url]) {
      console.log('Found cached data URL');
      return urlMappings[url];
    }
  } catch (e) {
    console.error('Error retrieving cached URL:', e);
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
  
  // Check if the URL is a data URL from localStorage
  if (url.startsWith('data:image/') || url.startsWith('blob:')) {
    return url;
  }
  
  // For AWS S3 presigned URLs
  if (isS3PresignedUrl(url)) {
    try {
      // Try to get the actual data URL from localStorage
      const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
      if (urlMappings[url]) {
        return urlMappings[url];
      }
    } catch (e) {
      console.error('Error retrieving cached image URL:', e);
    }
    return url;
  }
  
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
  
  // For relative URLs, ensure they have the correct base path
  if (url.startsWith('/')) {
    const basePath = window.location.origin;
    return `${basePath}${url}`;
  }
  
  // Check if there's a cached version in localStorage
  try {
    const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    if (urlMappings[url]) {
      return urlMappings[url];
    }
  } catch (e) {
    console.error('Error retrieving cached image URL:', e);
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
 * First attempts to refresh S3 URLs if applicable
 * @param url URL of the audio file to test
 * @returns Promise that resolves with a boolean indicating if the audio is playable
 */
export const isAudioPlayable = async (url: string): Promise<boolean> => {
  // Try to refresh S3 URL if needed
  let processedUrl = url;
  if (isS3PresignedUrl(url)) {
    const refreshedUrl = await refreshS3Url(url);
    if (refreshedUrl) {
      processedUrl = refreshedUrl;
    }
    
    // Also check if we have a cached data URL
    try {
      const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
      if (urlMappings[processedUrl]) {
        processedUrl = urlMappings[processedUrl];
        console.log('Using cached data URL for playback test');
      }
    } catch (e) {
      console.error('Error retrieving cached URL for playback test:', e);
    }
  }
  
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
      console.log('Audio is playable:', processedUrl);
      cleanup();
      resolve(true);
    };
    
    const onError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      cleanup();
      
      // For S3 URLs, let's try the original URL directly
      if (isS3PresignedUrl(url) && processedUrl !== url) {
        console.log('Trying original URL as fallback');
        const fallbackAudio = new Audio();
        fallbackAudio.oncanplaythrough = () => {
          console.log('Fallback audio is playable');
          fallbackAudio.src = '';
          resolve(true);
        };
        fallbackAudio.onerror = () => {
          console.error('Fallback audio playback error');
          fallbackAudio.src = '';
          resolve(false);
        };
        fallbackAudio.src = url;
        return;
      }
      
      resolve(false);
    };
    
    timeoutId = window.setTimeout(() => {
      console.warn('Audio load timeout:', processedUrl);
      cleanup();
      resolve(false);
    }, 8000);
    
    audio.addEventListener('canplaythrough', onSuccess);
    audio.addEventListener('error', onError);
    
    // Process the URL first to ensure it's in a playable format
    console.log('Testing audio playability:', processedUrl);
    audio.src = getPlayableAudioUrl(processedUrl);
    audio.load();
  });
};

/**
 * Store audio file in local storage
 * @param file Audio file to store
 * @returns Promise resolving to a URL reference to retrieve the audio
 */
export const storeAudioFileLocally = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileId = Date.now().toString();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        // Store the file data in localStorage
        try {
          localStorage.setItem(`audio_${fileId}`, event.target.result as string);
          console.log('Audio file stored locally with ID:', fileId);
          resolve(`localfile:${fileId}`);
        } catch (e) {
          console.error('Error storing audio in localStorage:', e);
          reject(e);
        }
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Remove locally stored audio file
 * @param audioUrl URL reference to the audio file
 * @returns Boolean indicating success
 */
export const removeLocalAudioFile = (audioUrl: string): boolean => {
  if (audioUrl.startsWith('localfile:')) {
    try {
      const fileKey = audioUrl.replace('localfile:', '');
      localStorage.removeItem(`audio_${fileKey}`);
      console.log('Removed local audio file:', fileKey);
      return true;
    } catch (e) {
      console.error('Error removing local audio file:', e);
      return false;
    }
  }
  return false;
};
