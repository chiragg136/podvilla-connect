
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { clearStoredMedia } from '@/utils/awsS3Utils';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import TrendingSection from '@/components/TrendingSection';
import AppFooter from '@/components/AppFooter';
import { PodcastService } from '@/services/podcastService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data and fetch podcasts
  useEffect(() => {
    const initializeData = async () => {
      try {
        await PodcastService.getAllPodcasts();
      } catch (error) {
        console.error('Error fetching podcasts from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleClearMedia = () => {
    const confirmed = window.confirm('Are you sure you want to clear all stored media? This will remove all cached audio and may help resolve playback issues.');
    if (confirmed) {
      if (clearStoredMedia()) {
        toast.success('All stored media has been cleared');
        // Reload the page to apply changes
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="destructive" 
            size="sm"
            className="mb-8 flex items-center gap-2"
            onClick={handleClearMedia}
          >
            <Trash2 className="h-4 w-4" />
            Clear All Stored Media
          </Button>
        </div>
        <FeaturesSection />
        <TrendingSection isLoading={isLoading} />
      </main>
      
      <AppFooter />
    </div>
  );
}
