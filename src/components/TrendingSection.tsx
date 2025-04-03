
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from '@/components/PodcastCard';
import { podcastService, Podcast } from '@/services/podcastService';
import { Skeleton } from '@/components/ui/skeleton';

export interface TrendingSectionProps {
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
        // Get all podcasts
        const allPodcasts = await podcastService.getAllPodcasts();
        
        // Check if we have user-uploaded podcasts in localStorage
        const userPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
        
        if (userPodcasts.length > 0) {
          // If user has uploaded podcasts, show those first
          const formattedUserPodcasts = userPodcasts.map((podcast: any) => ({
            id: podcast.id,
            title: podcast.title,
            creator: podcast.creator || 'You',
            coverImage: podcast.coverImage,
            coverImageCid: podcast.coverImageCid, // Add for IPFS
            ipfsCid: podcast.ipfsCid, // Add for IPFS
            description: podcast.description,
            categories: [podcast.category],
            totalEpisodes: podcast.episodes?.length || 0
          }));
          
          // Combine user podcasts with mock podcasts but prioritize user podcasts
          const combinedPodcasts = [
            ...formattedUserPodcasts.slice(0, 2),
            ...allPodcasts.filter(p => !formattedUserPodcasts.some((up: any) => up.id === p.id))
          ].slice(0, 4);
          
          setPodcasts(combinedPodcasts);
        } else {
          // If no user podcasts, just show the first 4 mock podcasts
          setPodcasts(allPodcasts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching trending podcasts:', error);
        // Fallback to empty array if error
        setPodcasts([]);
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
              <div key={index} className="rounded-xl overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.length > 0 ? (
              podcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  id={podcast.id}
                  title={podcast.title}
                  creator={podcast.creator}
                  coverImage={podcast.coverImage}
                  duration={`${podcast.totalEpisodes} episodes`}
                  onPlay={() => onPlayPodcast(podcast.id)}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-primary-600">No podcasts available. Upload your first podcast!</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/upload')}
                >
                  Upload Podcast
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingSection;
