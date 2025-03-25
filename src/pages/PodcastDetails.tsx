import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Pause, Heart, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';

const PodcastDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [podcast, setPodcast] = useState({
    id: '',
    title: '',
    description: '',
    creator: '',
    coverImage: '',
    audioUrl: '',
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchPodcast = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching podcast data
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock podcast data
        const mockPodcast = {
          id: id || '1',
          title: 'The Future of Technology',
          description: 'A podcast discussing the latest trends and innovations in technology.',
          creator: 'TechGuru',
          coverImage: 'https://images.unsplash.com/photo-1496181133206-80fa9e748b63?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        };

        setPodcast(mockPodcast);
      } catch (error) {
        console.error('Error fetching podcast:', error);
        toast.error('Failed to load podcast details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcast();
  }, [id]);

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast('Please login first', { 
        description: 'You need to be logged in to subscribe to podcasts' 
      });
      navigate('/login');
      return;
    }
    
    // Simulate subscribe logic
    toast.success('Subscribed successfully!');
  };
  
  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add this podcast to your favorites.');
      return;
    }
    
    // Simulate favorite logic
    toast.success('Added to favorites!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-64" /></CardTitle>
              <CardDescription><Skeleton className="h-4 w-40" /></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{podcast.title}</CardTitle>
              <CardDescription>By {podcast.creator}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="relative w-full aspect-video rounded-md overflow-hidden">
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <p>{podcast.description}</p>
              <div className="flex justify-between items-center">
                <Button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleFavorite}>
                    <Heart className="mr-2 h-4 w-4" />
                    Favorite
                  </Button>
                  <Button variant="outline" onClick={handleSubscribe}>
                    Subscribe
                  </Button>
                  <Button variant="secondary">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default PodcastDetails;
