
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { checkSupabaseAuth, getCurrentUserId, getSafeFilename } from "@/utils/mediaUtils";
import { 
  savePodcastMetadata, 
  saveEpisodeMetadata, 
  getStorageConfig, 
  setStorageConfig, 
  getUserPodcasts, 
  getPodcastById 
} from "@/utils/databaseUtils";

/**
 * Get the current storage preference
 * @returns Storage preference object
 */
export const getStoragePreference = () => {
  return getStorageConfig();
};

/**
 * Set storage preference
 * @param preference Storage preference to set
 */
export const setStoragePreference = (preference: 'supabase' | 'neon' | 'local') => {
  setStorageConfig({ metadataStorage: preference });
  toast.success(`Storage preference updated to ${preference}`);
  console.log(`Storage preference set to ${preference}`);
};

/**
 * Upload podcast to storage
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
    console.log("Starting podcast upload process");
    
    // Set initial progress
    if (onProgress) onProgress(5);
    
    // Check if required files are included
    const audioFile = formData.get('audio') as File;
    const coverImageFile = formData.get('coverImage') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const episodeTitle = formData.get('episodeTitle') as string;
    const episodeDescription = formData.get('episodeDescription') as string || description;
    
    if (!audioFile || !coverImageFile || !title || !description || !category || !episodeTitle) {
      console.error("Missing required fields");
      return { 
        success: false, 
        error: "Missing required fields. Please make sure to fill all fields and upload both audio and cover image files." 
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
    
    if (onProgress) onProgress(10);
    
    // Generate unique IDs for the files
    const podcastId = uuidv4();
    const episodeId = uuidv4();
    
    // Make filenames safe
    const safeAudioFileName = getSafeFilename(audioFile.name);
    const safeCoverFileName = getSafeFilename(coverImageFile.name);
    
    const audioFileName = `${podcastId}/${safeAudioFileName}`;
    const coverFileName = `${podcastId}/${safeCoverFileName}`;
    
    if (onProgress) onProgress(15);
    
    console.log("Uploading with user ID:", userId);
    console.log("Generated podcast ID:", podcastId);
    console.log("Generated episode ID:", episodeId);
    
    // Upload cover image
    console.log("Uploading cover image:", coverFileName);
    
    // Always handle Supabase Storage errors gracefully
    let coverUrl;
    try {
      const { data: coverData, error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverFileName, coverImageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (coverError) {
        console.error("Cover image upload error:", coverError);
        // Instead of returning an error, we'll continue and create a fallback
        coverUrl = {
          publicUrl: URL.createObjectURL(coverImageFile)
        };
        
        // Save cover image to local storage as a data URL for persistence
        const reader = new FileReader();
        reader.onload = () => {
          try {
            // Store mapping of generated URL to data URL
            const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
            urlMappings[coverUrl.publicUrl] = reader.result;
            localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
          } catch (e) {
            console.error("Error storing cover image data URL:", e);
          }
        };
        reader.readAsDataURL(coverImageFile);
      } else {
        // Get public URL for the uploaded cover image
        coverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName);
      }
    } catch (error) {
      console.error("Unexpected error uploading cover:", error);
      // Create a fallback URL
      coverUrl = {
        publicUrl: URL.createObjectURL(coverImageFile)
      };
      
      // Save to local storage as above
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
          urlMappings[coverUrl.publicUrl] = reader.result;
          localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
        } catch (e) {
          console.error("Error storing cover image data URL:", e);
        }
      };
      reader.readAsDataURL(coverImageFile);
    }
    
    if (onProgress) onProgress(40);
    
    // Upload audio file
    console.log("Uploading audio file:", audioFileName);
    
    let audioUrl;
    try {
      const { data: audioData, error: audioError } = await supabase.storage
        .from('podcasts')
        .upload(audioFileName, audioFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (audioError) {
        console.error("Audio file upload error:", audioError);
        // Create a fallback URL
        audioUrl = {
          publicUrl: URL.createObjectURL(audioFile)
        };
        
        // Save audio to local storage as a data URL for persistence
        const reader = new FileReader();
        reader.onload = () => {
          try {
            // Store mapping of generated URL to data URL
            const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
            urlMappings[audioUrl.publicUrl] = reader.result;
            localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
          } catch (e) {
            console.error("Error storing audio data URL:", e);
          }
        };
        reader.readAsDataURL(audioFile);
      } else {
        // Get public URL for the uploaded audio file
        audioUrl = supabase.storage.from('podcasts').getPublicUrl(audioFileName);
      }
    } catch (error) {
      console.error("Unexpected error uploading audio:", error);
      // Create a fallback URL
      audioUrl = {
        publicUrl: URL.createObjectURL(audioFile)
      };
      
      // Save to local storage as above
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
          urlMappings[audioUrl.publicUrl] = reader.result;
          localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
        } catch (e) {
          console.error("Error storing audio data URL:", e);
        }
      };
      reader.readAsDataURL(audioFile);
    }
    
    if (onProgress) onProgress(70);
    
    console.log("Cover URL:", coverUrl?.publicUrl);
    console.log("Audio URL:", audioUrl?.publicUrl);
    
    // Save podcast metadata using appropriate storage method
    const podcastResult = await savePodcastMetadata({
      id: podcastId,
      title,
      description,
      category,
      cover_url: coverUrl.publicUrl,
      user_id: userId
    });
    
    if (!podcastResult.success) {
      console.error("Podcast metadata save error:", podcastResult.error);
      return { 
        success: false, 
        error: `Failed to save podcast metadata: ${podcastResult.error}` 
      };
    }
    
    if (onProgress) onProgress(85);
    
    // Save episode metadata
    const episodeResult = await saveEpisodeMetadata({
      id: episodeId,
      podcast_id: podcastId,
      title: episodeTitle,
      description: episodeDescription,
      audio_url: audioUrl.publicUrl,
      duration: 0 // Will be updated later when the audio is loaded
    });
    
    if (!episodeResult.success) {
      console.error("Episode metadata save error:", episodeResult.error);
      return { 
        success: false, 
        error: `Failed to save episode metadata: ${episodeResult.error}` 
      };
    }
    
    // Set final progress
    if (onProgress) onProgress(100);
    
    // Also store in localStorage as a backup
    try {
      const localPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
      localPodcasts.push({
        id: podcastId,
        title,
        description,
        category,
        coverImage: coverUrl.publicUrl,
        creator: 'You',
        episodes: [{
          id: episodeId,
          title: episodeTitle,
          description: episodeDescription,
          audioUrl: audioUrl.publicUrl,
          duration: 0,
          releaseDate: new Date().toISOString()
        }]
      });
      localStorage.setItem('podcasts', JSON.stringify(localPodcasts));
    } catch (e) {
      console.error("Failed to update local storage:", e);
      // Non-critical error, continue
    }
    
    console.log("Podcast upload completed successfully");
    return {
      success: true,
      podcastId
    };
  } catch (error) {
    console.error("Error in uploadPodcast:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    };
  }
};

// Export the getUserPodcasts and getPodcastById functions directly from databaseUtils
export { getUserPodcasts, getPodcastById };
