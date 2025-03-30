
import { supabase } from "@/integrations/supabase/client";
import { handlePodcastUpload } from './podcastUploadHandler';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get the current storage preference
 * @returns Storage preference ('supabase')
 */
export const getStoragePreference = (): 'supabase' => {
  // Always use Supabase for storage
  return 'supabase';
};

/**
 * Set storage preference
 * @param preference Storage preference to set
 */
export const setStoragePreference = (preference: 'supabase') => {
  localStorage.setItem('storagePreference', preference);
};

/**
 * Upload podcast to Supabase storage
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
    console.log("Starting podcast upload with Supabase storage");
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("User not authenticated");
      return { 
        success: false, 
        error: "Authentication required. Please log in to upload podcasts." 
      };
    }
    
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
    
    // Generate unique IDs for the files
    const podcastId = uuidv4();
    const episodeId = uuidv4();
    const audioFileName = `${podcastId}/${audioFile.name.replace(/\s+/g, '_')}`;
    const coverFileName = `${podcastId}/${coverImageFile.name.replace(/\s+/g, '_')}`;
    
    // Set initial progress
    if (onProgress) onProgress(10);
    
    // Use the actual authenticated user ID from session
    const actualUserId = session.user.id;
    console.log("Uploading with authenticated user ID:", actualUserId);
    
    // Upload cover image first
    const { data: coverData, error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverFileName, coverImageFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (coverError) {
      console.error("Cover image upload error:", coverError);
      return { 
        success: false, 
        error: `Failed to upload cover image: ${coverError.message}` 
      };
    }
    
    if (onProgress) onProgress(40);
    
    // Upload audio file
    const { data: audioData, error: audioError } = await supabase.storage
      .from('podcasts')
      .upload(audioFileName, audioFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (audioError) {
      console.error("Audio file upload error:", audioError);
      
      // Clean up: Delete the already uploaded cover image
      await supabase.storage.from('covers').remove([coverFileName]);
      
      return { 
        success: false, 
        error: `Failed to upload audio file: ${audioError.message}` 
      };
    }
    
    if (onProgress) onProgress(80);
    
    // Get public URLs for the uploaded files
    const { data: coverUrl } = supabase.storage.from('covers').getPublicUrl(coverFileName);
    const { data: audioUrl } = supabase.storage.from('podcasts').getPublicUrl(audioFileName);
    
    // Insert podcast metadata into database
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .insert({
        id: podcastId,
        title,
        description,
        category,
        cover_url: coverUrl.publicUrl,
        user_id: actualUserId // Use the authenticated user ID, not the passed userId
      })
      .select()
      .single();
    
    if (podcastError) {
      console.error("Podcast metadata insert error:", podcastError);
      
      // Clean up: Delete the uploaded files
      await supabase.storage.from('covers').remove([coverFileName]);
      await supabase.storage.from('podcasts').remove([audioFileName]);
      
      return { 
        success: false, 
        error: `Failed to save podcast metadata: ${podcastError.message}` 
      };
    }
    
    // Insert episode metadata into database
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert({
        id: episodeId,
        podcast_id: podcastId,
        title: episodeTitle,
        description: episodeDescription,
        audio_url: audioUrl.publicUrl,
        duration: 0 // Will be updated later when the audio is loaded
      })
      .select()
      .single();
    
    if (episodeError) {
      console.error("Episode metadata insert error:", episodeError);
      
      // Clean up: Delete the uploaded files and podcast metadata
      await supabase.storage.from('covers').remove([coverFileName]);
      await supabase.storage.from('podcasts').remove([audioFileName]);
      await supabase.from('podcasts').delete().eq('id', podcastId);
      
      return { 
        success: false, 
        error: `Failed to save episode metadata: ${episodeError.message}` 
      };
    }
    
    // Set final progress
    if (onProgress) onProgress(100);
    
    // Store local cache of uploaded podcasts
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

/**
 * Get all podcasts for the current user
 * @param userId User ID
 * @returns List of podcasts
 */
export const getUserPodcasts = async (userId: string) => {
  const { data, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching user podcasts:", error);
    toast.error("Failed to fetch your podcasts");
    return [];
  }
  
  return data || [];
};

/**
 * Get a podcast by ID
 * @param podcastId Podcast ID
 * @returns Podcast data with episodes
 */
export const getPodcastById = async (podcastId: string) => {
  const { data, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes(*)
    `)
    .eq('id', podcastId)
    .single();
  
  if (error) {
    console.error("Error fetching podcast:", error);
    toast.error("Failed to fetch podcast details");
    return null;
  }
  
  return data;
};
