
import { uploadToGoogleDrive, storePodcastMetadata, getGoogleDriveDownloadLink } from '@/utils/googleDriveStorage';

/**
 * Handle podcast upload to Google Drive
 * @param formData Form data containing podcast files and metadata
 * @param userId User ID
 * @param onProgress Progress callback
 * @returns Upload result
 */
export const handleGoogleDrivePodcastUpload = async (
  formData: FormData,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; podcastId?: string; error?: string }> => {
  try {
    // Extract data from form
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const audioFile = formData.get('audio') as File;
    const coverImageFile = formData.get('coverImage') as File;
    const episodeTitle = formData.get('episodeTitle') as string;
    const episodeDescription = formData.get('episodeDescription') as string;

    // Upload cover image to Google Drive
    const coverImageResult = await uploadToGoogleDrive(
      coverImageFile,
      (progress) => {
        if (onProgress) onProgress(progress * 0.3); // 30% of the total progress
      }
    );

    if (!coverImageResult.success) {
      throw new Error(`Failed to upload cover image: ${coverImageResult.error}`);
    }

    // Upload audio file to Google Drive
    const audioResult = await uploadToGoogleDrive(
      audioFile,
      (progress) => {
        if (onProgress) onProgress(30 + progress * 0.6); // 60% of the total progress (from 30% to 90%)
      }
    );

    if (!audioResult.success) {
      throw new Error(`Failed to upload audio file: ${audioResult.error}`);
    }

    // Create podcast metadata
    const podcastId = `podcast-${Date.now()}`;
    const episodeId = `episode-${Date.now()}`;
    const timestamp = new Date();
    
    const podcastMetadata = {
      id: podcastId,
      userId,
      title,
      description,
      category,
      coverImage: coverImageResult.url,
      coverImageFileId: coverImageResult.fileId,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
      episodes: [
        {
          id: episodeId,
          title: episodeTitle,
          description: episodeDescription || description,
          audioUrl: audioResult.url,
          audioFileId: audioResult.fileId,
          duration: "300", // 5 minutes as a default
          createdAt: timestamp.toISOString()
        }
      ]
    };

    // Store metadata in Google Drive
    await storePodcastMetadata(podcastMetadata);

    // Save to localStorage for persistence in demo app
    const existingPodcasts = localStorage.getItem('podcasts');
    let podcasts = [];
    
    if (existingPodcasts) {
      podcasts = JSON.parse(existingPodcasts);
    }
    
    podcasts.push({
      id: podcastId,
      title,
      description,
      category,
      coverImage: coverImageResult.url,
      coverImageFileId: coverImageResult.fileId,
      creator: "You",
      totalEpisodes: 1,
      createdAt: timestamp.toISOString(),
      episodes: [
        {
          id: episodeId,
          title: episodeTitle,
          description: episodeDescription || description,
          audioUrl: audioResult.url,
          audioFileId: audioResult.fileId,
          duration: 300, // 5 minutes as default
          releaseDate: timestamp.toISOString(),
          isExclusive: false
        }
      ]
    });
    
    localStorage.setItem('podcasts', JSON.stringify(podcasts));
    
    // Log for debugging
    console.log("Uploaded podcast metadata:", {
      podcastId,
      audioUrl: audioResult.url,
      audioFileId: audioResult.fileId,
      coverImageUrl: coverImageResult.url,
      coverImageFileId: coverImageResult.fileId
    });

    if (onProgress) onProgress(100);

    return {
      success: true,
      podcastId
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
};
