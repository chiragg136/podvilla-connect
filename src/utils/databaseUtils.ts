
import { supabase } from "@/integrations/supabase/client";
import { checkSupabaseAuth, getCurrentUserId } from "./mediaUtils";
import { toast } from "sonner";

/**
 * Database utility functions for handling both Supabase and local storage fallback
 */

interface StorageConfig {
  filesStorage: 'supabase'; // Currently only supporting Supabase for files
  metadataStorage: 'supabase' | 'neon' | 'local'; // Support both Supabase, Neon and local for metadata
}

// Default configuration
let storageConfig: StorageConfig = {
  filesStorage: 'supabase',
  metadataStorage: 'local' // Default to local storage until Supabase/Neon is confirmed working
};

/**
 * Set storage configuration
 * @param config Storage configuration object
 */
export const setStorageConfig = (config: Partial<StorageConfig>) => {
  storageConfig = { ...storageConfig, ...config };
  localStorage.setItem('storageConfig', JSON.stringify(storageConfig));
  console.log('Storage config updated:', storageConfig);
};

/**
 * Get current storage configuration
 * @returns Storage configuration
 */
export const getStorageConfig = (): StorageConfig => {
  try {
    const savedConfig = localStorage.getItem('storageConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error("Error loading storage config:", error);
  }
  return storageConfig;
};

/**
 * Save podcast metadata to the database
 * @param podcastData Podcast metadata
 * @returns Success indicator and podcast ID
 */
export const savePodcastMetadata = async (
  podcastData: {
    id: string;
    title: string;
    description: string;
    category: string;
    cover_url: string;
    user_id: string;
  }
) => {
  const config = getStorageConfig();
  
  try {
    // For non-local storage, ensure user is authenticated
    if (config.metadataStorage !== 'local') {
      const isAuth = await checkSupabaseAuth();
      if (!isAuth) {
        console.log("Auth required but user not authenticated, falling back to local storage");
        return saveToLocalStorage(podcastData);
      }
      
      // Get real user ID from auth
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log("User ID not available, falling back to local storage");
        return saveToLocalStorage(podcastData);
      }
      
      // Override with actual authenticated user ID
      podcastData = {
        ...podcastData,
        user_id: userId
      };
    }
    
    // Handle based on selected storage option
    switch (config.metadataStorage) {
      case 'neon':
        console.log("Using Neon PostgreSQL for metadata (fallback to local for now)");
        return saveToLocalStorage(podcastData);
      case 'supabase':
        try {
          const result = await saveToSupabase(podcastData);
          if (!result.success) {
            console.log("Supabase save failed, falling back to local storage");
            return saveToLocalStorage(podcastData);
          }
          return result;
        } catch (error) {
          console.error("Error saving to Supabase:", error);
          console.log("Falling back to local storage");
          return saveToLocalStorage(podcastData);
        }
      case 'local':
      default:
        return saveToLocalStorage(podcastData);
    }
  } catch (error) {
    console.error("Error saving podcast metadata:", error);
    console.log("Falling back to local storage");
    return saveToLocalStorage(podcastData);
  }
};

/**
 * Save podcast metadata to Supabase
 * @param data Podcast data
 * @returns Success indicator and podcast ID
 */
const saveToSupabase = async (data: any) => {
  try {
    const { data: result, error } = await supabase
      .from('podcasts')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase metadata save error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Unexpected error in saveToSupabase:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in Supabase save' 
    };
  }
};

/**
 * Save podcast metadata to local storage
 * @param data Podcast data
 * @returns Success indicator and podcast ID
 */
const saveToLocalStorage = async (data: any) => {
  try {
    // Get existing podcasts from local storage
    const existingPodcasts = JSON.parse(localStorage.getItem('localPodcasts') || '[]');
    
    // Add new podcast
    existingPodcasts.push({
      ...data,
      created_at: new Date().toISOString()
    });
    
    // Save back to local storage
    localStorage.setItem('localPodcasts', JSON.stringify(existingPodcasts));
    
    return { 
      success: true, 
      data: {
        ...data,
        created_at: new Date().toISOString()
      } 
    };
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in localStorage save' 
    };
  }
};

/**
 * Save episode metadata to the database
 * @param episodeData Episode metadata
 * @returns Success indicator and episode ID
 */
export const saveEpisodeMetadata = async (
  episodeData: {
    id: string;
    podcast_id: string;
    title: string;
    description: string;
    audio_url: string;
    duration: number;
  }
) => {
  const config = getStorageConfig();
  
  try {
    // Handle based on selected storage option
    switch (config.metadataStorage) {
      case 'neon':
        console.log("Using Neon PostgreSQL for episode metadata (fallback to local for now)");
        return saveEpisodeToLocalStorage(episodeData);
      case 'supabase':
        try {
          const result = await saveEpisodeToSupabase(episodeData);
          if (!result.success) {
            console.log("Supabase episode save failed, falling back to local storage");
            return saveEpisodeToLocalStorage(episodeData);
          }
          return result;
        } catch (error) {
          console.error("Error saving to Supabase:", error);
          console.log("Falling back to local storage for episode");
          return saveEpisodeToLocalStorage(episodeData);
        }
      case 'local':
      default:
        return saveEpisodeToLocalStorage(episodeData);
    }
  } catch (error) {
    console.error("Error saving episode metadata:", error);
    console.log("Falling back to local storage for episode");
    return saveEpisodeToLocalStorage(episodeData);
  }
};

/**
 * Save episode metadata to Supabase
 * @param data Episode data
 * @returns Success indicator and episode ID
 */
const saveEpisodeToSupabase = async (data: any) => {
  try {
    const { data: result, error } = await supabase
      .from('episodes')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase episode save error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Unexpected error in saveEpisodeToSupabase:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in Supabase episode save' 
    };
  }
};

/**
 * Save episode metadata to local storage
 * @param data Episode data
 * @returns Success indicator and episode ID
 */
const saveEpisodeToLocalStorage = async (data: any) => {
  try {
    // Get existing episodes from local storage
    const existingEpisodes = JSON.parse(localStorage.getItem('localEpisodes') || '[]');
    
    // Add new episode
    existingEpisodes.push({
      ...data,
      created_at: new Date().toISOString()
    });
    
    // Save back to local storage
    localStorage.setItem('localEpisodes', JSON.stringify(existingEpisodes));
    
    // Also update the podcast object to include this episode
    try {
      const existingPodcasts = JSON.parse(localStorage.getItem('localPodcasts') || '[]');
      const podcastIndex = existingPodcasts.findIndex((p: any) => p.id === data.podcast_id);
      
      if (podcastIndex >= 0) {
        // Initialize episodes array if it doesn't exist
        if (!existingPodcasts[podcastIndex].episodes) {
          existingPodcasts[podcastIndex].episodes = [];
        }
        
        // Add episode to podcast
        existingPodcasts[podcastIndex].episodes.push({
          ...data,
          created_at: new Date().toISOString()
        });
        
        // Save back to local storage
        localStorage.setItem('localPodcasts', JSON.stringify(existingPodcasts));
      }
    } catch (e) {
      console.error("Error updating podcast with episode:", e);
      // Non-critical error, continue
    }
    
    return { 
      success: true, 
      data: {
        ...data,
        created_at: new Date().toISOString()
      } 
    };
  } catch (error) {
    console.error("Error saving episode to localStorage:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error in localStorage episode save' 
    };
  }
};

/**
 * Get all podcasts for the current user
 * @returns List of podcasts
 */
export const getUserPodcasts = async () => {
  const config = getStorageConfig();
  
  try {
    switch (config.metadataStorage) {
      case 'neon':
        console.log("Using Neon PostgreSQL for getting podcasts (fallback to local for now)");
        return getLocalPodcasts();
      case 'supabase':
        try {
          const userId = await getCurrentUserId();
          
          if (!userId) {
            console.log("User ID not available, falling back to local storage for podcasts");
            return getLocalPodcasts();
          }
          
          const { data, error } = await supabase
            .from('podcasts')
            .select(`
              *,
              episodes(*)
            `)
            .eq('user_id', userId);
          
          if (error) {
            console.error("Error fetching user podcasts from Supabase:", error);
            return getLocalPodcasts();
          }
          
          return data || [];
        } catch (error) {
          console.error("Error in Supabase getUserPodcasts:", error);
          return getLocalPodcasts();
        }
      case 'local':
      default:
        return getLocalPodcasts();
    }
  } catch (error) {
    console.error("Error in getUserPodcasts:", error);
    return getLocalPodcasts();
  }
};

/**
 * Get all podcasts from local storage
 * @returns List of podcasts
 */
const getLocalPodcasts = () => {
  try {
    const podcasts = JSON.parse(localStorage.getItem('localPodcasts') || '[]');
    
    // Enhance podcasts with episodes
    const episodes = JSON.parse(localStorage.getItem('localEpisodes') || '[]');
    
    return podcasts.map((podcast: any) => {
      const podcastEpisodes = episodes.filter((ep: any) => ep.podcast_id === podcast.id);
      return {
        ...podcast,
        episodes: podcastEpisodes
      };
    });
  } catch (error) {
    console.error("Error getting podcasts from localStorage:", error);
    return [];
  }
};

/**
 * Get a podcast by ID
 * @param podcastId Podcast ID
 * @returns Podcast data with episodes
 */
export const getPodcastById = async (podcastId: string) => {
  const config = getStorageConfig();
  
  try {
    switch (config.metadataStorage) {
      case 'neon':
        console.log("Using Neon PostgreSQL for getting podcast details (fallback to local for now)");
        return getLocalPodcastById(podcastId);
      case 'supabase':
        try {
          const { data, error } = await supabase
            .from('podcasts')
            .select(`
              *,
              episodes(*)
            `)
            .eq('id', podcastId)
            .single();
          
          if (error) {
            console.error("Error fetching podcast from Supabase:", error);
            return getLocalPodcastById(podcastId);
          }
          
          return data;
        } catch (error) {
          console.error("Error in Supabase getPodcastById:", error);
          return getLocalPodcastById(podcastId);
        }
      case 'local':
      default:
        return getLocalPodcastById(podcastId);
    }
  } catch (error) {
    console.error("Error in getPodcastById:", error);
    return getLocalPodcastById(podcastId);
  }
};

/**
 * Get podcast by ID from local storage
 * @param podcastId Podcast ID
 * @returns Podcast data with episodes
 */
const getLocalPodcastById = (podcastId: string) => {
  try {
    const podcasts = JSON.parse(localStorage.getItem('localPodcasts') || '[]');
    const podcast = podcasts.find((p: any) => p.id === podcastId);
    
    if (!podcast) {
      return null;
    }
    
    // Get episodes for this podcast
    const episodes = JSON.parse(localStorage.getItem('localEpisodes') || '[]');
    const podcastEpisodes = episodes.filter((ep: any) => ep.podcast_id === podcastId);
    
    return {
      ...podcast,
      episodes: podcastEpisodes
    };
  } catch (error) {
    console.error("Error getting podcast from localStorage:", error);
    return null;
  }
};
