
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PodcastCategory from '@/components/PodcastCategory';
import Player from '@/components/Player';
import AppFooter from '@/components/AppFooter';
import SearchBar from '@/components/SearchBar';
import { podcastService } from '@/services/podcastService';

const Browse = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time and fetch initial data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handlePlayPodcast = (id: string) => {
    setCurrentPodcastId(id);
  };

  // Categories
  const categories = [
    'All',
    'Technology',
    'Business',
    'Science',
    'Health',
    'Entertainment',
    'News',
    'Education',
    'Arts',
    'Sports'
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-6">
              Discover Podcasts
            </h1>
            <SearchBar />
          </div>
          
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    activeCategory === category
                      ? 'bg-primary-900 text-white'
                      : 'bg-gray-100 text-primary-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <PodcastCategory 
            title="Popular This Week"
            subtitle="Trending episodes that listeners are loving"
            viewAll="/popular"
            category={activeCategory}
            onPlayPodcast={handlePlayPodcast}
          />
          
          <PodcastCategory 
            title="New Releases"
            subtitle="Fresh content from your favorite creators"
            viewAll="/new"
            onPlayPodcast={handlePlayPodcast}
          />
          
          <PodcastCategory 
            title="Editor's Choice"
            subtitle="Hand-picked shows selected by our team"
            viewAll="/editors-choice"
            onPlayPodcast={handlePlayPodcast}
          />
        </div>
      </main>
      
      <AppFooter />
      <Player podcastId={currentPodcastId} />
    </div>
  );
};

export default Browse;
