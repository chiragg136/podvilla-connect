
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TrendingSection from '@/components/TrendingSection';
import Player from '@/components/Player';
import AppFooter from '@/components/AppFooter';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
        <HeroSection />
        <FeaturesSection />
        <TrendingSection />
      </main>
      
      <AppFooter />
      <Player />
    </div>
  );
};

export default Index;
