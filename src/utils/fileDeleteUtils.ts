
import { toast } from 'sonner';
import { deletePodcast } from './awsS3Utils';
import { removeLocalAudioFile } from './mediaUtils';

/**
 * Delete a podcast and all its related files
 * @param podcastId The ID of the podcast to delete
 * @returns Promise that resolves to a boolean indicating success
 */
export const deletePodcastWithFiles = async (podcastId: string): Promise<boolean> => {
  try {
    // Get existing podcasts from localStorage
    const existingPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    const podcastIndex = existingPodcasts.findIndex((p: any) => p.id === podcastId);
    
    if (podcastIndex === -1) {
      console.warn('Podcast not found:', podcastId);
      toast.error('Podcast not found');
      return false;
    }
    
    const podcast = existingPodcasts[podcastIndex];
    
    // Delete all episodes and their audio files
    if (podcast.episodes && Array.isArray(podcast.episodes)) {
      for (const episode of podcast.episodes) {
        if (episode.audioUrl) {
          // Clean up audio file from localStorage if it's a local file
          removeLocalAudioFile(episode.audioUrl);
          
          // Clean up URL mappings
          try {
            const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
            if (urlMappings[episode.audioUrl]) {
              delete urlMappings[episode.audioUrl];
              localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
            }
          } catch (e) {
            console.error('Error cleaning up URL mappings:', e);
          }
        }
      }
    }
    
    // Remove podcast from localStorage
    existingPodcasts.splice(podcastIndex, 1);
    localStorage.setItem('podcasts', JSON.stringify(existingPodcasts));
    
    // Also try AWS S3 deletion if applicable
    try {
      deletePodcast(podcastId);
    } catch (e) {
      console.error('Error with AWS S3 deletion:', e);
      // Continue anyway since we've already deleted from localStorage
    }
    
    toast.success('Podcast deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting podcast:', error);
    toast.error('An error occurred while deleting the podcast');
    return false;
  }
};

/**
 * Delete a specific episode from a podcast
 * @param podcastId The ID of the podcast
 * @param episodeId The ID of the episode to delete
 * @returns Promise that resolves to a boolean indicating success
 */
export const deleteEpisode = async (podcastId: string, episodeId: string): Promise<boolean> => {
  try {
    // Get existing podcasts from localStorage
    const existingPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    
    // Find the podcast
    const podcastIndex = existingPodcasts.findIndex((p: any) => p.id === podcastId);
    
    if (podcastIndex === -1) {
      console.warn('Podcast not found:', podcastId);
      return false;
    }
    
    const podcast = existingPodcasts[podcastIndex];
    
    // Find the episode
    if (!podcast.episodes || !Array.isArray(podcast.episodes)) {
      console.warn('No episodes found in podcast:', podcastId);
      return false;
    }
    
    const episodeIndex = podcast.episodes.findIndex((e: any) => e.id === episodeId);
    
    if (episodeIndex === -1) {
      console.warn('Episode not found:', episodeId);
      return false;
    }
    
    const episode = podcast.episodes[episodeIndex];
    
    // Clean up the audio file if it's a local file
    if (episode.audioUrl) {
      removeLocalAudioFile(episode.audioUrl);
    }
    
    // Clean up audio URL from URL mappings
    try {
      if (episode.audioUrl) {
        const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
        if (urlMappings[episode.audioUrl]) {
          delete urlMappings[episode.audioUrl];
          localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
        }
      }
    } catch (e) {
      console.error('Error cleaning up URL mappings:', e);
    }
    
    // Remove the episode from the podcast
    podcast.episodes.splice(episodeIndex, 1);
    
    // Update the podcast in the list
    existingPodcasts[podcastIndex] = podcast;
    
    // Save back to localStorage
    localStorage.setItem('podcasts', JSON.stringify(existingPodcasts));
    
    toast.success('Episode deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting episode:', error);
    toast.error('Failed to delete episode');
    return false;
  }
};
