
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/custom.css'
// Initialize Google Drive storage
import './utils/googleDriveStorage.ts'

// Initialize demo podcasts for Google Drive integration
const initializeGoogleDriveDemo = () => {
  // Check if we already have demo data in localStorage
  if (!localStorage.getItem('googleDriveInitialized')) {
    console.log('Initializing Google Drive demo data');
    localStorage.setItem('googleDriveInitialized', 'true');
    
    // Create demo files
    localStorage.setItem('googleDriveFiles', JSON.stringify([
      {
        id: 'demo-audio-1',
        name: 'Tech Talk Episode 1.mp3',
        type: 'audio/mp3',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo audio URL
        uploadDate: new Date().toISOString()
      },
      {
        id: 'demo-audio-2',
        name: 'Science Weekly.mp3',
        type: 'audio/mp3',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Demo audio URL
        uploadDate: new Date().toISOString()
      }
    ]));
    
    // Create demo podcast metadata
    localStorage.setItem('podcastMetadata', JSON.stringify([
      {
        id: 'demo-podcast-1',
        userId: 'demo-user',
        title: 'Tech Insights Podcast',
        description: 'The latest insights on technology trends and innovations.',
        category: 'Technology',
        coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coverImageFileId: 'demo-cover-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        episodes: [
          {
            id: 'demo-episode-1',
            title: 'The Future of AI',
            description: 'Exploring the most exciting developments in artificial intelligence.',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Demo audio URL
            audioFileId: 'demo-audio-1',
            duration: "180", // 3 minutes
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 'demo-podcast-2',
        userId: 'demo-user',
        title: 'Science Weekly',
        description: 'Breaking down the latest scientific discoveries and research.',
        category: 'Science',
        coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coverImageFileId: 'demo-cover-2',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        episodes: [
          {
            id: 'demo-episode-2',
            title: 'Climate Change Research',
            description: 'The latest findings on climate change and environmental science.',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Demo audio URL
            audioFileId: 'demo-audio-2',
            duration: "240", // 4 minutes
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
          }
        ]
      }
    ]));
    
    // Also add these to the regular podcasts collection for browsing
    localStorage.setItem('podcasts', JSON.stringify([
      {
        id: 'demo-podcast-1',
        title: 'Tech Insights Podcast',
        description: 'The latest insights on technology trends and innovations.',
        category: 'Technology',
        coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coverImageFileId: 'demo-cover-1',
        creator: 'Tech Expert',
        totalEpisodes: 1,
        createdAt: new Date().toISOString(),
        episodes: [
          {
            id: 'demo-episode-1',
            title: 'The Future of AI',
            description: 'Exploring the most exciting developments in artificial intelligence.',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            audioFileId: 'demo-audio-1',
            duration: 180,
            releaseDate: new Date().toISOString(),
            isExclusive: false
          }
        ]
      },
      {
        id: 'demo-podcast-2',
        title: 'Science Weekly',
        description: 'Breaking down the latest scientific discoveries and research.',
        category: 'Science',
        coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coverImageFileId: 'demo-cover-2',
        creator: 'Science Team',
        totalEpisodes: 1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        episodes: [
          {
            id: 'demo-episode-2',
            title: 'Climate Change Research',
            description: 'The latest findings on climate change and environmental science.',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            audioFileId: 'demo-audio-2',
            duration: 240,
            releaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            isExclusive: false
          }
        ]
      }
    ]));
  }
};

// Initialize demo data
initializeGoogleDriveDemo();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
