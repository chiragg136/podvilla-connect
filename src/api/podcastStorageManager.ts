
import { handleGoogleDrivePodcastUpload } from './googleDriveUploadHandler';
import { handleIpfsPodcastUpload } from './ipfsUploadHandler';

/**
 * Get the current storage preference
 * @returns Storage preference ('googleDrive' or 'ipfs')
 */
export const getStoragePreference = (): 'googleDrive' | 'ipfs' => {
  // Safely get from localStorage with fallback to Google Drive
  const preference = localStorage.getItem('storagePreference');
  return (preference === 'ipfs') ? 'ipfs' : 'googleDrive';
};

/**
 * Set storage preference
 * @param preference Storage preference to set
 */
export const setStoragePreference = (preference: 'googleDrive' | 'ipfs') => {
  localStorage.setItem('storagePreference', preference);
};

/**
 * Upload podcast to the preferred storage
 * @param formData Form data with podcast files and metadata
 * @param userId User ID
 * @param onProgress Progress callback
 * @returns Upload result
 */
export const uploadPodcast = async (
  formData: FormData,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; podcastId?: string; error?: string }> => {
  try {
    console.log("Starting podcast upload with storage preference:", getStoragePreference());
    
    // Force Google Drive storage
    setStoragePreference('googleDrive');
    
    // Check if required files are included
    const audioFile = formData.get('audio') as File;
    const coverImageFile = formData.get('coverImage') as File;
    
    if (!audioFile || !coverImageFile) {
      console.error("Missing required files:", { audioFile: !!audioFile, coverImageFile: !!coverImageFile });
      return { 
        success: false, 
        error: "Missing required files. Please make sure to upload both audio and cover image files." 
      };
    }
    
    // Check file sizes
    const maxSizeMB = 50;
    if (audioFile.size > maxSizeMB * 1024 * 1024) {
      console.error(`Audio file size (${Math.round(audioFile.size / 1024 / 1024 * 10) / 10} MB) exceeds limit`);
      return { 
        success: false, 
        error: `Audio file size exceeds the ${maxSizeMB}MB limit. Please upload a smaller file.` 
      };
    }
    
    if (coverImageFile.size > 10 * 1024 * 1024) {  // 10MB limit for cover images
      return { 
        success: false, 
        error: "Cover image file size exceeds the 10MB limit. Please upload a smaller image." 
      };
    }
    
    // Using Google Drive (enforced)
    return await handleGoogleDrivePodcastUpload(formData, userId, onProgress);
  } catch (error) {
    console.error("Error in uploadPodcast:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
};
