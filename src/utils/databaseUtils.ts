
import { supabase } from "@/integrations/supabase/client";
import { checkSupabaseAuth, getCurrentUserId } from "./mediaUtils";

/**
 * Database utility functions for handling both Supabase and Neon PostgreSQL
 */

interface StorageConfig {
  filesStorage: 'supabase'; // Currently only supporting Supabase for files
  metadataStorage: 'supabase' | 'neon'; // Support both Supabase and Neon for metadata
}

// Default configuration
let storageConfig: StorageConfig = {
  filesStorage: 'supabase',
  metadataStorage: 'supabase' // Default to Supabase for now
};

/**
 * Set storage configuration
 * @param config Storage configuration object
 */
export const setStorageConfig = (config: Partial<StorageConfig>) => {
  storageConfig = { ...storageConfig, ...config };
  localStorage.setItem('storageConfig', JSON.stringify(storageConfig));
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
    // Ensure user is authenticated
    const isAuth = await checkSupabaseAuth();
    if (!isAuth) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Get real user ID from auth
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'User ID not available' };
    }
    
    // Override with actual authenticated user ID
    const dataWithAuthUserId = {
      ...podcastData,
      user_id: userId
    };
    
    // Handle based on selected storage option
    if (config.metadataStorage === 'neon') {
      // This is where Neon integration would go
      // For now, we'll fall back to Supabase until Neon is properly integrated
      console.log("Using Neon PostgreSQL for metadata (fallback to Supabase for now)");
      return saveToSupabase(dataWithAuthUserId);
    } else {
      // Use Supabase
      return saveToSupabase(dataWithAuthUserId);
    }
  } catch (error) {
    console.error("Error saving podcast metadata:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error saving podcast metadata' 
    };
  }
};

/**
 * Save podcast metadata to Supabase
 * @param data Podcast data
 * @returns Success indicator and podcast ID
 */
const saveToSupabase = async (data: any) => {
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
    if (config.metadataStorage === 'neon') {
      // This is where Neon integration would go
      // For now, we'll fall back to Supabase until Neon is properly integrated
      console.log("Using Neon PostgreSQL for episode metadata (fallback to Supabase for now)");
      return saveEpisodeToSupabase(episodeData);
    } else {
      // Use Supabase
      return saveEpisodeToSupabase(episodeData);
    }
  } catch (error) {
    console.error("Error saving episode metadata:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error saving episode metadata' 
    };
  }
};

/**
 * Save episode metadata to Supabase
 * @param data Episode data
 * @returns Success indicator and episode ID
 */
const saveEpisodeToSupabase = async (data: any) => {
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
};
