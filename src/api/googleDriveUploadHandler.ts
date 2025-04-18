
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
    console.log("Starting Google Drive upload process");
    
    // Extract data from form
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const audioFile = formData.get('audio') as File;
    const coverImageFile = formData.get('coverImage') as File;
    const episodeTitle = formData.get('episodeTitle') as string;
    const episodeDescription = formData.get('episodeDescription') as string;

    // Validate files are present
    if (!audioFile || !coverImageFile) {
      console.error("Missing required files:", { audioFile: !!audioFile, coverImageFile: !!coverImageFile });
      throw new Error("Missing required files. Please make sure to upload both audio and cover image files.");
    }

    // Validate audio file type
    const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'video/mp4', 'audio/wav', 'audio/x-m4a'];
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
    const isValidType = validAudioTypes.includes(audioFile.type) || 
                       ['mp3', 'mp4', 'wav', 'm4a'].includes(fileExtension || '');
    
    if (!isValidType) {
      console.error("Invalid audio file type:", audioFile.type);
      throw new Error(`Invalid audio file type: ${audioFile.type}. Please upload an MP3, MP4, WAV, or M4A file.`);
    }

    console.log("Form data extracted:", { 
      title, 
      category, 
      audioFileName: audioFile.name,
      audioFileType: audioFile.type,
      audioFileSize: `${Math.round(audioFile.size / 1024 / 1024 * 10) / 10} MB`,
      coverImageFileName: coverImageFile.name
    });

    // Upload cover image to Google Drive
    console.log("Uploading cover image to Google Drive");
    const coverImageResult = await uploadToGoogleDrive(
      coverImageFile,
      (progress) => {
        if (onProgress) onProgress(progress * 0.3); // 30% of the total progress
      }
    );

    if (!coverImageResult.success || !coverImageResult.fileId || !coverImageResult.url) {
      const errorMsg = coverImageResult.error || "Failed to upload cover image";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log("Cover image uploaded successfully:", coverImageResult);

    // Upload audio file to Google Drive
    console.log("Uploading audio file to Google Drive");
    const audioResult = await uploadToGoogleDrive(
      audioFile,
      (progress) => {
        if (onProgress) onProgress(30 + progress * 0.6); // 60% of the total progress (from 30% to 90%)
      }
    );

    if (!audioResult.success || !audioResult.fileId || !audioResult.url) {
      const errorMsg = audioResult.error || "Failed to upload audio file";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log("Audio file uploaded successfully:", audioResult);

    // Create podcast metadata
    const podcastId = `podcast-${Date.now()}`;
    const episodeId = `episode-${Date.now()}`;
    const timestamp = new Date();
    
    // Get audio duration (in a real implementation this would extract actual duration)
    // For now we'll use a placeholder value
    const audioDuration = "300"; // 5 minutes as a default
    
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
          duration: audioDuration,
          createdAt: timestamp.toISOString()
        }
      ]
    };

    console.log("Storing podcast metadata");
    // Store metadata
    await storePodcastMetadata(podcastMetadata);

    // Save to localStorage for persistence in demo app
    try {
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
    } catch (storageError) {
      console.error("Error saving to localStorage:", storageError);
      // Continue even if localStorage fails - this is just for persistence in the demo
    }
    
    // Log for debugging
    console.log("Podcast upload completed successfully:", {
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
