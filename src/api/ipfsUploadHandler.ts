
import { uploadToIpfs, storePodcastMetadata } from '@/utils/ipfsStorage';

/**
 * Handle podcast upload to IPFS
 * @param formData Form data containing podcast files and metadata
 * @param userId User ID
 * @param onProgress Progress callback
 * @returns Upload result
 */
export const handleIpfsPodcastUpload = async (
  formData: FormData,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; podcastId?: string; error?: string }> => {
  try {
    console.log("Starting IPFS upload process");
    
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

    console.log("Form data extracted:", { 
      title, 
      category, 
      audioFileName: audioFile.name,
      audioFileType: audioFile.type,
      audioFileSize: `${Math.round(audioFile.size / 1024 / 1024 * 10) / 10} MB`,
      coverImageFileName: coverImageFile.name
    });

    // Upload cover image to IPFS
    console.log("Uploading cover image to IPFS");
    const coverImageResult = await uploadToIpfs(
      coverImageFile,
      (progress) => {
        if (onProgress) onProgress(progress * 0.3); // 30% of the total progress
      }
    );

    if (!coverImageResult.success) {
      throw new Error(`Failed to upload cover image: ${coverImageResult.error}`);
    }
    
    console.log("Cover image uploaded successfully:", coverImageResult);

    // Upload audio file to IPFS
    console.log("Uploading audio file to IPFS");
    const audioResult = await uploadToIpfs(
      audioFile,
      (progress) => {
        if (onProgress) onProgress(30 + progress * 0.6); // 60% of the total progress (from 30% to 90%)
      }
    );

    if (!audioResult.success) {
      throw new Error(`Failed to upload audio file: ${audioResult.error}`);
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
      coverImageCid: coverImageResult.cid,
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
      episodes: [
        {
          id: episodeId,
          title: episodeTitle,
          description: episodeDescription || description,
          audioUrl: audioResult.url,
          audioCid: audioResult.cid,
          duration: audioDuration,
          createdAt: timestamp.toISOString()
        }
      ]
    };

    console.log("Storing podcast metadata");
    // Store metadata in IPFS
    await storePodcastMetadata(podcastMetadata);

    if (onProgress) onProgress(100);

    return {
      success: true,
      podcastId
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
};
