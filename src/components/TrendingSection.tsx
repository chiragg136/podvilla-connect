
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from '@/components/PodcastCard';
import { podcastService, Podcast } from '@/services/podcastService';

interface TrendingSectionProps {
  onPlayPodcast: (id: string) => void;
}

const TrendingSection = ({ onPlayPodcast }: TrendingSectionProps) => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      try {
        // Get all podcasts and take the first 4 as trending
        const allPodcasts = await podcastService.getAllPodcasts();
        setPodcasts(allPodcasts.slice(0, 4));
      } catch (error) {
        console.error('Error fetching trending podcasts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPodcasts();
  }, []);
  
  const handleViewAll = () => {
    navigate('/discover');
  };
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-900">Trending Now</h2>
          <Button 
            variant="link" 
            className="text-accent-purple flex items-center"
            onClick={handleViewAll}
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, index) => (
              <div key={index} className="rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id}
                id={podcast.id}
                title={podcast.title}
                creator={podcast.creator}
                coverImage={podcast.coverImage}
                duration={`${podcast.totalEpisodes} episodes`}
                onPlay={() => onPlayPodcast(podcast.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingSection;
