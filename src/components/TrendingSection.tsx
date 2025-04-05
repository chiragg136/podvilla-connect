import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from '@/components/PodcastCard';
import { podcastService, Podcast } from '@/services/podcastService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { clearStoredMedia } from '@/utils/awsS3Utils';
import { deletePodcastWithFiles } from '@/utils/fileDeleteUtils';

export interface TrendingSectionProps {
  onPlayPodcast: (id: string) => void;
}

const TrendingSection = ({ onPlayPodcast }: TrendingSectionProps) => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPodcasts();
  }, []);
  
  const fetchPodcasts = async () => {
    setIsLoading(true);
    try {
      const allPodcasts = await podcastService.getAllPodcasts();
      
      const userPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
      
      if (userPodcasts.length > 0) {
        const formattedUserPodcasts = userPodcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          creator: podcast.creator || 'You',
          coverImage: podcast.coverImage,
          coverImageCid: podcast.coverImageCid,
          ipfsCid: podcast.ipfsCid,
          description: podcast.description,
          categories: [podcast.category],
          totalEpisodes: podcast.episodes?.length || 0
        }));
        
        const combinedPodcasts = [
          ...formattedUserPodcasts.slice(0, 2),
          ...allPodcasts.filter(p => !formattedUserPodcasts.some((up: any) => up.id === p.id))
        ].slice(0, 4);
        
        setPodcasts(combinedPodcasts);
      } else {
        setPodcasts(allPodcasts.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching trending podcasts:', error);
      setPodcasts([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewAll = () => {
    navigate('/discover');
  };
  
  const handleDeletePodcast = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this podcast? This action cannot be undone.')) {
      try {
        const success = await deletePodcastWithFiles(id);
        
        if (success) {
          fetchPodcasts();
        }
      } catch (error) {
        console.error('Error deleting podcast:', error);
        toast.error('Failed to delete podcast');
      }
    }
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
                <div key={podcast.id} className="relative group">
                  <PodcastCard
                    id={podcast.id}
                    title={podcast.title}
                    creator={podcast.creator}
                    coverImage={podcast.coverImage}
                    duration={`${podcast.totalEpisodes} episodes`}
                    onPlay={() => onPlayPodcast(podcast.id)}
                  />
                  
                  {podcast.creator === 'You' && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeletePodcast(podcast.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
