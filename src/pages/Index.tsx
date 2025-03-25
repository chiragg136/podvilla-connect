
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TrendingSection from '@/components/TrendingSection';
import Player from '@/components/Player';
import AppFooter from '@/components/AppFooter';
import { podcastService } from '@/services/podcastService';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPodcast, setCurrentPodcast] = useState<string | null>(null);

  useEffect(() => {
    // Initialize podcast data and simulate loading
    const initializeData = async () => {
      try {
        // Preload some podcast data
        await podcastService.getAllPodcasts();
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        // Simulate loading time
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    initializeData();
  }, []);

  const handlePlayPodcast = (podcastId: string) => {
    setCurrentPodcast(podcastId);
  };

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
      
      <main className="flex-grow">
        <HeroSection onPlay={handlePlayPodcast} />
        <FeaturesSection />
        <TrendingSection onPlayPodcast={handlePlayPodcast} />
      </main>
      
      <AppFooter />
      <Player podcastId={currentPodcast} isPlaying={currentPodcast !== null} />
    </div>
  );
};

export default Index;
