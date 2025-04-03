
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// AWS S3 credentials type
interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

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
 * Store AWS credentials in local storage
 * @param credentials AWS credentials
 */
export const setAwsCredentials = (credentials: AwsCredentials): void => {
  localStorage.setItem('awsCredentials', JSON.stringify(credentials));
};

/**
 * Get AWS credentials from local storage
 * @returns AWS credentials or null if not found
 */
export const getAwsCredentials = (): AwsCredentials | null => {
  const credentials = localStorage.getItem('awsCredentials');
  return credentials ? JSON.parse(credentials) : null;
};

/**
 * Check if AWS S3 credentials are configured
 * @returns Boolean indicating if credentials are configured
 */
export const areAwsCredentialsConfigured = (): boolean => {
  const credentials = getAwsCredentials();
  return !!credentials && !!credentials.accessKeyId && !!credentials.secretAccessKey;
};

/**
 * Upload a file to AWS S3
 * @param file File to upload
 * @param key S3 key (path)
 * @param onProgress Progress callback
 * @returns URL of the uploaded file if successful, otherwise null
 */
export const uploadFileToS3 = async (
  file: File, 
  key: string,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  // Mock implementation since we're not actually connecting to S3
  try {
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(Math.min(progress, 99));
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    }
    
    // Wait for "upload" to complete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a fake S3 URL
    return `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=FAKE&X-Amz-Date=20230615T000000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=fake`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return null;
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
    localStorage.removeItem('podcasts');
    
    // Clear local episodes data
    localStorage.removeItem('localEpisodes');
    
    // Clear any media blobs in storage
    localStorage.removeItem('mediaBlobs');
    
    // Clear any other media-related items
    localStorage.removeItem('lastPlayedMedia');
    localStorage.removeItem('playbackPositions');
    
    // Clear IndexedDB audio storage if available
    try {
      indexedDB.deleteDatabase('audioCache');
    } catch (e) {
      console.error('Failed to clear IndexedDB cache:', e);
    }
    
    console.log('Successfully cleared all stored media');
    return true;
  } catch (error) {
    console.error('Error clearing stored media:', error);
    toast.error('Failed to clear stored media');
    return false;
  }
};

/**
 * Delete a specific podcast from local storage
 * @param podcastId ID of the podcast to delete
 * @returns Boolean indicating success
 */
export const deletePodcast = (podcastId: string): boolean => {
  try {
    // Get existing podcasts from localStorage
    const existingPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    
    // Find the podcast to delete to get its files
    const podcastToDelete = existingPodcasts.find((p: any) => p.id === podcastId);
    
    if (!podcastToDelete) {
      console.warn('Podcast not found:', podcastId);
      return false;
    }
    
    // Clean up related media from URL mappings
    try {
      const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
      
      // Clean up cover image
      if (podcastToDelete.coverImage && urlMappings[podcastToDelete.coverImage]) {
        delete urlMappings[podcastToDelete.coverImage];
      }
      
      // Clean up audio files from episodes
      if (podcastToDelete.episodes) {
        podcastToDelete.episodes.forEach((episode: any) => {
          if (episode.audioUrl && urlMappings[episode.audioUrl]) {
            delete urlMappings[episode.audioUrl];
          }
        });
      }
      
      localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
    } catch (e) {
      console.error('Error cleaning up URL mappings:', e);
    }
    
    // Remove the podcast from the list
    const updatedPodcasts = existingPodcasts.filter((p: any) => p.id !== podcastId);
    localStorage.setItem('podcasts', JSON.stringify(updatedPodcasts));
    
    console.log('Successfully deleted podcast:', podcastId);
    return true;
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return false;
  }
};
