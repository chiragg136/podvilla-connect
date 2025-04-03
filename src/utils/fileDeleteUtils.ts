
import { toast } from 'sonner';
import { deletePodcast } from './awsS3Utils';

/**
 * Delete a podcast and all its related files
 * @param podcastId The ID of the podcast to delete
 * @returns Promise that resolves to a boolean indicating success
 */
export const deletePodcastWithFiles = async (podcastId: string): Promise<boolean> => {
  try {
    // First try to delete from local storage
    const success = deletePodcast(podcastId);
    
    if (success) {
      toast.success('Podcast deleted successfully');
      return true;
    } else {
      // If local deletion fails, there might be an error
      toast.error('Failed to delete podcast');
      return false;
    }
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
