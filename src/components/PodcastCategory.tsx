
import { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from './PodcastCard';
import { Link } from 'react-router-dom';
import { podcastService, Podcast } from '@/services/podcastService';

interface PodcastCategoryProps {
  title: string;
  subtitle?: string;
  viewAll?: string;
  category?: string;
  onPlayPodcast?: (id: string) => void;
}

const PodcastCategory = ({ 
  title, 
  subtitle, 
  viewAll, 
  category,
  onPlayPodcast 
}: PodcastCategoryProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadPodcasts = async () => {
      setIsLoading(true);
      try {
        let podcastData: Podcast[] = [];
        
        if (category) {
          podcastData = await podcastService.getPodcastsByCategory(category);
        } else {
          podcastData = await podcastService.getAllPodcasts();
          // Shuffle the podcasts to simulate different categories
          podcastData = podcastData.sort(() => Math.random() - 0.5).slice(0, 6);
        }
        
        setPodcasts(podcastData);
      } catch (error) {
        console.error('Error loading podcasts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPodcasts();
  }, [category]);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      if (onPlayPodcast) onPlayPodcast('');
    } else {
      setPlayingId(id);
      if (onPlayPodcast) onPlayPodcast(id);
    }
  };

  return (
    <section ref={sectionRef} className="mb-16">
      <div className={`mb-6 flex justify-between items-end transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-primary-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {viewAll && (
          <Link to={viewAll}>
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {Array(6).fill(null).map((_, index) => (
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {podcasts.map((podcast, index) => (
            <div 
              key={podcast.id}
              className={`transform transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <PodcastCard
                id={podcast.id}
                title={podcast.title}
                creator={podcast.creator}
                coverImage={podcast.coverImage}
                duration={`${podcast.totalEpisodes} episodes`}
                isNew={index % 3 === 0}
                isTrending={index % 4 === 0}
                onPlay={handlePlay}
                isPlaying={playingId === podcast.id}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PodcastCategory;
