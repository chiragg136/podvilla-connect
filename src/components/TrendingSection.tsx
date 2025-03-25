
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from '@/components/PodcastCard';
import { podcastService } from '@/services/podcastService';

interface TrendingSectionProps {
  onPlayPodcast: (id: string) => void;
}

const TrendingSection = ({ onPlayPodcast }: TrendingSectionProps) => {
  const navigate = useNavigate();
  const [podcasts] = useState(podcastService.getTrendingPodcasts());
  
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
      </div>
    </section>
  );
};

export default TrendingSection;
