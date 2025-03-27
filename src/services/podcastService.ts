
import { toast } from "sonner";

// Define podcast interfaces
export interface Podcast {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  description: string;
  categories: string[];
  totalEpisodes: number;
  isFeatured?: boolean;
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  audioFileId?: string; // Adding audioFileId as optional property
  duration: number; // in seconds
  releaseDate: string;
  isExclusive: boolean;
}

// Mock podcast data
const mockPodcasts: Podcast[] = [
  {
    id: 'featured-podcast',
    title: 'The Daily Tech',
    creator: 'Tech Insights',
    coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Daily insights into the tech world, covering the latest news, trends, and innovations that are shaping our digital future.',
    categories: ['Technology', 'News'],
    totalEpisodes: 156,
    isFeatured: true
  },
  {
    id: '1',
    title: 'Design Matters with Anna',
    creator: 'Anna Roberts',
    coverImage: 'https://images.unsplash.com/photo-1599689018356-f4bae9bf4bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Conversations with the world\'s top designers about creative process, inspiration, and the intersection of design and life.',
    categories: ['Design', 'Arts', 'Business'],
    totalEpisodes: 89
  },
  {
    id: '2',
    title: 'Tech Today',
    creator: 'James Wilson',
    coverImage: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Breaking down the latest technology trends and how they impact our daily lives and future society.',
    categories: ['Technology', 'Science'],
    totalEpisodes: 112
  },
  {
    id: '3',
    title: 'The Future of AI',
    creator: 'Emily Chen',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Exploring artificial intelligence advancements and their implications for humanity, ethics, and the workplace.',
    categories: ['Technology', 'Science', 'Education'],
    totalEpisodes: 45
  },
  {
    id: '4',
    title: 'Mindful Moments',
    creator: 'Sarah Johnson',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Guided meditations and mindfulness practices to help you stay present, reduce stress, and cultivate inner peace.',
    categories: ['Health', 'Education'],
    totalEpisodes: 78
  },
  {
    id: '5',
    title: 'Global Economics',
    creator: 'Michael Brown',
    coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Analyzing global economic trends, market movements, and financial strategies for today\'s complex economic landscape.',
    categories: ['Business', 'News', 'Education'],
    totalEpisodes: 67
  },
  {
    id: '6',
    title: 'Creative Writing',
    creator: 'Lisa Morgan',
    coverImage: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Practical tips and inspiration for aspiring writers, from novel writing to storytelling techniques and publishing advice.',
    categories: ['Arts', 'Education'],
    totalEpisodes: 92
  }
];

// Mock episodes data
const mockEpisodes: Record<string, Episode[]> = {
  'featured-podcast': [
    {
      id: 'featured-ep1',
      podcastId: 'featured-podcast',
      title: 'The Rise of AI in Everyday Tech',
      description: 'Exploring how artificial intelligence is changing the way we interact with technology in our daily lives.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 1860, // 31 minutes
      releaseDate: '2023-08-15',
      isExclusive: false
    },
    {
      id: 'featured-ep2',
      podcastId: 'featured-podcast',
      title: 'Web3 and the Future of the Internet',
      description: 'A deep dive into how blockchain technology is reshaping the internet as we know it.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 2220, // 37 minutes
      releaseDate: '2023-08-08',
      isExclusive: false
    },
    {
      id: 'featured-ep3',
      podcastId: 'featured-podcast',
      title: 'The Metaverse: Beyond Gaming',
      description: 'How the metaverse is expanding beyond gaming into work, education, and social interaction.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 1980, // 33 minutes
      releaseDate: '2023-08-01',
      isExclusive: true
    }
  ],
  '1': [
    {
      id: '1-ep1',
      podcastId: '1',
      title: 'The Psychology of Design',
      description: 'How design influences human behavior and decision-making in subtle ways.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 2700, // 45 minutes
      releaseDate: '2023-08-14',
      isExclusive: false
    },
    {
      id: '1-ep2',
      podcastId: '1',
      title: 'Minimalism in Product Design',
      description: 'Exploring the principles of minimalist design and its impact on user experience.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 2400, // 40 minutes
      releaseDate: '2023-08-07',
      isExclusive: false
    }
  ],
  '2': [
    {
      id: '2-ep1',
      podcastId: '2',
      title: 'The Future of Electric Vehicles',
      description: 'How electric vehicles are reshaping transportation and environmental impact.',
      audioUrl: 'https://example.com/audio-file.mp3',
      duration: 1920, // 32 minutes
      releaseDate: '2023-08-16',
      isExclusive: false
    }
  ]
};

// Mock user library data
interface UserLibrary {
  favoriteIds: string[];
  listeningHistory: {
    episodeId: string;
    timestamp: string;
    progress: number;
  }[];
  playlists: {
    id: string;
    name: string;
    episodeIds: string[];
  }[];
  downloads: string[];
}

// Mock user library
const mockUserLibrary: UserLibrary = {
  favoriteIds: [],
  listeningHistory: [],
  playlists: [],
  downloads: []
};

class PodcastService {
  // Get all podcasts
  async getAllPodcasts(): Promise<Podcast[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPodcasts];
  }

  // Get featured podcasts
  async getFeaturedPodcasts(): Promise<Podcast[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPodcasts.filter(podcast => podcast.isFeatured);
  }

  // Get podcast by ID
  async getPodcastById(id: string): Promise<Podcast | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    const podcast = mockPodcasts.find(p => p.id === id);
    return podcast || null;
  }

  // Get episodes by podcast ID
  async getEpisodesByPodcastId(podcastId: string): Promise<Episode[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockEpisodes[podcastId] || [];
  }

  // Get episode by ID
  async getEpisodeById(episodeId: string): Promise<Episode | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    for (const podcastId in mockEpisodes) {
      const episode = mockEpisodes[podcastId].find(ep => ep.id === episodeId);
      if (episode) return episode;
    }
    
    return null;
  }

  // Search podcasts
  async searchPodcasts(query: string): Promise<Podcast[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return mockPodcasts.filter(
      podcast => 
        podcast.title.toLowerCase().includes(lowerQuery) ||
        podcast.creator.toLowerCase().includes(lowerQuery) ||
        podcast.description.toLowerCase().includes(lowerQuery) ||
        podcast.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  }

  // Get podcasts by category
  async getPodcastsByCategory(category: string): Promise<Podcast[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (category === 'All') return [...mockPodcasts];
    
    return mockPodcasts.filter(
      podcast => podcast.categories.some(cat => cat === category)
    );
  }

  // Toggle favorite podcast
  async toggleFavoritePodcast(podcastId: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockUserLibrary.favoriteIds.indexOf(podcastId);
    
    if (index === -1) {
      mockUserLibrary.favoriteIds.push(podcastId);
      toast.success('Added to favorites');
    } else {
      mockUserLibrary.favoriteIds.splice(index, 1);
      toast.success('Removed from favorites');
    }
    
    return index === -1; // Returns true if it was added, false if removed
  }

  // Check if podcast is favorited
  async isPodcastFavorited(podcastId: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockUserLibrary.favoriteIds.includes(podcastId);
  }

  // Get user library
  async getUserLibrary(): Promise<UserLibrary> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockUserLibrary };
  }

  // Add podcast to listening history
  async addToListeningHistory(episodeId: string, progress: number): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const existingIndex = mockUserLibrary.listeningHistory.findIndex(
      item => item.episodeId === episodeId
    );
    
    if (existingIndex !== -1) {
      mockUserLibrary.listeningHistory[existingIndex].progress = progress;
      mockUserLibrary.listeningHistory[existingIndex].timestamp = new Date().toISOString();
    } else {
      mockUserLibrary.listeningHistory.push({
        episodeId,
        progress,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Add download
  async addDownload(episodeId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!mockUserLibrary.downloads.includes(episodeId)) {
      mockUserLibrary.downloads.push(episodeId);
      toast.success('Episode downloaded for offline listening');
    }
  }
}

// Create and export a singleton instance
export const podcastService = new PodcastService();
