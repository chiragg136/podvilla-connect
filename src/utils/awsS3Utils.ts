
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Check if a URL is an AWS S3 presigned URL
 * @param url URL to check
 * @returns Boolean indicating if the URL is an S3 presigned URL
 */
export const isS3PresignedUrl = (url: string): boolean => {
  // Check if the URL contains typical S3 presigned URL parameters
  return url.includes('X-Amz-Signature=') && 
    (url.includes('amazonaws.com') || url.includes('digitaloceanspaces.com'));
};

/**
 * Attempt to refresh an S3 presigned URL if needed
 * @param url Original S3 URL
 * @returns Refreshed URL if successful, otherwise the original URL
 */
export const refreshS3Url = async (url: string): Promise<string> => {
  if (!isS3PresignedUrl(url)) {
    return url;
  }
  
  try {
    // Extract the key from the URL (everything after the last slash before the query params)
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const key = pathParts[pathParts.length - 1];
    
    // Call Supabase function if available to get a new presigned URL
    if (supabase) {
      const { data, error } = await supabase
        .storage
        .from('podcasts')
        .createSignedUrl(key, 60 * 60); // 1 hour expiry
      
      if (!error && data) {
        console.log('Refreshed S3 URL successfully');
        return data.signedUrl;
      }
    }
    
    console.warn('Could not refresh S3 URL, using original');
    return url;
  } catch (error) {
    console.error('Error refreshing S3 URL:', error);
    return url;
  }
};

/**
 * Clear all stored media from local storage
 * This function clears:
 * 1. URL mappings (cached media data URLs)
 * 2. Local podcasts and episodes data
 * 3. Any other media-related cache items
 * 
 * @returns Boolean indicating success
 */
export const clearStoredMedia = (): boolean => {
  try {
    // Clear URL mappings (cached data URLs)
    localStorage.removeItem('urlMappings');
    
    // Clear local podcasts data
    localStorage.removeItem('localPodcasts');
    
    // Clear local episodes data
    localStorage.removeItem('localEpisodes');
    
    // Clear any media blobs in storage
    localStorage.removeItem('mediaBlobs');
    
    // Clear any other media-related items
    localStorage.removeItem('lastPlayedMedia');
    localStorage.removeItem('playbackPositions');
    
    console.log('Successfully cleared all stored media');
    return true;
  } catch (error) {
    console.error('Error clearing stored media:', error);
    toast.error('Failed to clear stored media');
    return false;
  }
};
