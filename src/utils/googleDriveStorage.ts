
/**
 * Google Drive Storage Utility
 * This utility provides functions to interact with Google Drive for file storage
 */

// Google Drive folder ID from the shared link
const GOOGLE_DRIVE_FOLDER_ID = '1hAMnd3HG-PzILMxRYr7brffqcaUZKCcA';

// Google Drive API endpoints
const GOOGLE_DRIVE_BASE_URL = 'https://www.googleapis.com/drive/v3';
const GOOGLE_DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Get the direct download link for a Google Drive file
 * This creates a direct download URL that can be used in audio/video players
 * @param fileId Google Drive file ID
 * @returns Direct download URL
 */
export const getGoogleDriveDownloadLink = (fileId: string): string => {
  // Use the direct streaming URL format
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

/**
 * Get the view link for a Google Drive file
 * @param fileId Google Drive file ID
 * @returns View URL
 */
export const getGoogleDriveViewLink = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

/**
 * Get a list of files from the configured Google Drive folder
 * This uses the publicly accessible folder without authentication
 * @returns Array of file objects with id, name, and download URL
 */
export const getFilesFromGoogleDrive = async () => {
  try {
    console.log('Getting files from Google Drive folder:', GOOGLE_DRIVE_FOLDER_ID);
    
    // For a real implementation, we would use the Google Drive API
    // For demo purposes, we'll use a hardcoded list of files from the shared folder
    const mockFiles = [
      {
        id: '1sample-audio-file',
        name: 'Sample Podcast Episode',
        mimeType: 'audio/mp3',
        downloadUrl: getGoogleDriveDownloadLink('1sample-audio-file'),
        viewUrl: getGoogleDriveViewLink('1sample-audio-file')
      }
    ];
    
    // In production, this would fetch the actual files from Google Drive
    return mockFiles;
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    throw error;
  }
};

/**
 * Generate a public URL for a file stored in Google Drive
 * @param fileName Original file name
 * @returns Object with file ID and public URL
 */
export const generateGoogleDrivePublicUrl = (fileName: string) => {
  // In a real implementation, this would generate a valid Google Drive URL
  // For demo purposes, we're creating a placeholder URL with a timestamp to make it unique
  const demoFileId = `demo-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  
  return {
    fileId: demoFileId,
    publicUrl: getGoogleDriveDownloadLink(demoFileId)
  };
};

/**
 * Upload a file to Google Drive
 * Note: This is a mock implementation
 * In production, you would need to implement OAuth2 authentication
 * and use the Google Drive API properly
 * 
 * @param file File to upload
 * @param onProgress Progress callback
 * @returns Object with upload result
 */
export const uploadToGoogleDrive = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> => {
  try {
    // Validate file exists
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty or not provided');
    }

    // For demonstration purposes, we'll simulate a file upload
    console.log(`Simulating upload of ${file.name} (${file.size} bytes, type: ${file.type}) to Google Drive`);
    
    // Add upload size limit check
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size exceeds the ${maxSizeMB}MB limit. Please upload a smaller file.`);
    }
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        if (onProgress) onProgress(progress);
      } else {
        clearInterval(progressInterval);
      }
    }, 300);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate a demo file ID that mimics a real Google Drive file ID
    const demoFileId = `demo-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Create a working direct download link
    const publicUrl = getGoogleDriveDownloadLink(demoFileId);
    
    clearInterval(progressInterval);
    if (onProgress) onProgress(100);
    
    console.log(`Upload complete. File ID: ${demoFileId}`);
    
    // Save info to localStorage to simulate persistence
    const storedFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]');
    storedFiles.push({
      id: demoFileId,
      name: file.name,
      type: file.type,
      url: publicUrl,
      uploadDate: new Date().toISOString()
    });
    localStorage.setItem('googleDriveFiles', JSON.stringify(storedFiles));
    
    return {
      success: true,
      fileId: demoFileId,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Store podcast metadata in Google Drive
 * In a real implementation, this would create a metadata file in Google Drive
 * 
 * @param metadata Podcast metadata object
 * @returns Success status
 */
export const storePodcastMetadata = async (metadata: any) => {
  try {
    // Log the metadata that would be stored
    console.log('Storing podcast metadata in Google Drive:', metadata);
    
    // In a real implementation, this would create a JSON file in Google Drive
    // For now, we'll store it in localStorage for demo purposes
    const storedPodcasts = JSON.parse(localStorage.getItem('podcastMetadata') || '[]');
    storedPodcasts.push(metadata);
    localStorage.setItem('podcastMetadata', JSON.stringify(storedPodcasts));
    
    // Also store in the main podcasts list to make it immediately available
    const existingPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    
    // Format the podcast for the main list if it's not already there
    const podcastForMainList = existingPodcasts.find((p: any) => p.id === metadata.id) || {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      coverImage: metadata.coverImage,
      coverImageFileId: metadata.coverImageFileId,
      creator: "You",
      totalEpisodes: metadata.episodes.length,
      createdAt: metadata.createdAt,
      episodes: metadata.episodes.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioUrl,
        audioFileId: ep.audioFileId,
        duration: typeof ep.duration === 'string' ? parseInt(ep.duration) : ep.duration,
        releaseDate: ep.createdAt,
        isExclusive: false
      }))
    };
    
    if (!existingPodcasts.find((p: any) => p.id === metadata.id)) {
      existingPodcasts.push(podcastForMainList);
      localStorage.setItem('podcasts', JSON.stringify(existingPodcasts));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error storing podcast metadata:', error);
    return { success: false, error };
  }
};

/**
 * Get podcast metadata from storage
 * 
 * @returns Array of podcast metadata objects
 */
export const getPodcastMetadata = async () => {
  try {
    // In a real implementation, this would fetch JSON files from Google Drive
    // For now, we'll retrieve from localStorage
    const storedPodcasts = JSON.parse(localStorage.getItem('podcastMetadata') || '[]');
    return storedPodcasts;
  } catch (error) {
    console.error('Error retrieving podcast metadata:', error);
    return [];
  }
};

/**
 * Function to get a file by ID
 * @param fileId File ID to retrieve
 * @returns File object if found, null otherwise
 */
export const getFileById = async (fileId: string) => {
  try {
    // In a real implementation, this would make an API call to Google Drive
    // For now, we'll check localStorage
    const storedFiles = JSON.parse(localStorage.getItem('googleDriveFiles') || '[]');
    const file = storedFiles.find((f: any) => f.id === fileId);
    
    if (file) {
      return {
        ...file,
        downloadUrl: getGoogleDriveDownloadLink(fileId),
        viewUrl: getGoogleDriveViewLink(fileId)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving file by ID:', error);
    return null;
  }
};

export default {
  uploadToGoogleDrive,
  getFilesFromGoogleDrive,
  getGoogleDriveDownloadLink,
  getGoogleDriveViewLink,
  storePodcastMetadata,
  getPodcastMetadata,
  getFileById
};
