
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { getSafeFilename } from "@/utils/mediaUtils";
import { podcastService } from "@/services/podcastService";

export const handlePodcastUpload = async (
  formData: FormData,
  userId: string,
  onProgress?: (progress: number) => void
) => {
  try {
    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const audioFile = formData.get('audio') as File;
    const coverImage = formData.get('coverImage') as File;
    const episodeTitle = formData.get('episodeTitle') as string;
    const episodeDescription = formData.get('episodeDescription') as string || description;
    
    if (!title || !description || !category || !audioFile || !coverImage || !episodeTitle) {
      throw new Error('Missing required fields for podcast upload');
    }
    
    // Set initial progress
    if (onProgress) onProgress(10);
    
    // Generate unique IDs and safe filenames
    const podcastId = uuidv4();
    const episodeId = uuidv4();
    
    const safeAudioName = getSafeFilename(audioFile.name);
    const safeCoverName = getSafeFilename(coverImage.name);
    
    const audioPath = `${podcastId}/${safeAudioName}`;
    const coverPath = `${podcastId}/${safeCoverName}`;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User is not authenticated. Please log in to upload podcasts.');
    }
    
    // Upload cover image
    if (onProgress) onProgress(20);
    const { data: coverData, error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverImage, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (coverError) {
      console.error('Cover upload error:', coverError);
      throw new Error(`Failed to upload cover image: ${coverError.message}`);
    }
    
    // Get public URL for cover image
    const { data: coverUrl } = supabase.storage.from('covers').getPublicUrl(coverPath);
    
    // Upload audio file
    if (onProgress) onProgress(40);
    const { data: audioData, error: audioError } = await supabase.storage
      .from('podcasts')
      .upload(audioPath, audioFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (audioError) {
      // Clean up the uploaded cover image
      await supabase.storage.from('covers').remove([coverPath]);
      console.error('Audio upload error:', audioError);
      throw new Error(`Failed to upload audio file: ${audioError.message}`);
    }
    
    // Get public URL for audio file
    const { data: audioUrl } = supabase.storage.from('podcasts').getPublicUrl(audioPath);
    
    if (onProgress) onProgress(70);
    
    // Save podcast metadata to database
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .insert({
        id: podcastId,
        title,
        description,
        category,
        cover_url: coverUrl.publicUrl,
        user_id: userId
      })
      .select()
      .single();
    
    if (podcastError) {
      // Clean up uploaded files
      await supabase.storage.from('covers').remove([coverPath]);
      await supabase.storage.from('podcasts').remove([audioPath]);
      console.error('Podcast metadata error:', podcastError);
      throw new Error(`Failed to save podcast metadata: ${podcastError.message}`);
    }
    
    if (onProgress) onProgress(85);
    
    // Save episode metadata to database
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert({
        id: episodeId,
        podcast_id: podcastId,
        title: episodeTitle,
        description: episodeDescription,
        audio_url: audioUrl.publicUrl,
        duration: 0 // Will be updated when audio is loaded
      })
      .select()
      .single();
    
    if (episodeError) {
      // Clean up uploaded files and podcast metadata
      await supabase.storage.from('covers').remove([coverPath]);
      await supabase.storage.from('podcasts').remove([audioPath]);
      await supabase.from('podcasts').delete().eq('id', podcastId);
      console.error('Episode metadata error:', episodeError);
      throw new Error(`Failed to save episode metadata: ${episodeError.message}`);
    }
    
    if (onProgress) onProgress(100);
    
    // Return success result
    return {
      success: true,
      podcast: {
        id: podcastId,
        title,
        description,
        creator: 'Current User',
        coverImage: coverUrl.publicUrl,
        categories: [category],
        totalEpisodes: 1,
        createdAt: new Date().toISOString(),
        userId,
      },
      episode: {
        id: episodeId,
        podcastId: podcastId,
        title: episodeTitle,
        description: episodeDescription,
        audioUrl: audioUrl.publicUrl,
        duration: 0,
        releaseDate: new Date().toISOString(),
        isExclusive: false,
      }
    };
  } catch (error) {
    console.error('Podcast upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload podcast' };
  }
};
