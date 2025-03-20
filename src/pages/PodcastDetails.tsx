
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Share2, Play, Pause, Clock, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';
import { podcastService, Podcast, Episode } from '@/services/podcastService';

const PodcastDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const loadPodcastDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const podcastData = await podcastService.getPodcastById(id);
        if (podcastData) {
          setPodcast(podcastData);
          
          // Get episodes
          const episodesData = await podcastService.getEpisodesByPodcastId(id);
          setEpisodes(episodesData);
          
          // Check if favorited
          if (user) {
            const favorited = await podcastService.isPodcastFavorited(id);
            setIsFavorited(favorited);
          }
        } else {
          toast('Podcast not found', {
            description: 'The podcast you are looking for could not be found.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error loading podcast details:', error);
        toast('Error loading podcast', {
          description: 'Failed to load podcast details. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPodcastDetails();
  }, [id, user]);

  const handlePlay = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast('Please login first', {
        description: 'You need to be logged in to favorite podcasts',
        variant: 'destructive'
      });
      return;
    }
    
    if (!podcast) return;
    
    try {
      const isNowFavorited = await podcastService.toggleFavoritePodcast(podcast.id);
      setIsFavorited(isNowFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast('Error', {
        description: 'Failed to update favorite status',
        variant: 'destructive'
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && podcast) {
      navigator.share({
        title: podcast.title,
        text: `Check out this podcast: ${podcast.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support share API
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied', {
        description: 'Podcast link copied to clipboard',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 pb-12">
        {isLoading ? (
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                </div>
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : podcast ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="sticky top-32">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={podcast.coverImage} 
                      alt={podcast.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleToggleFavorite} 
                      variant={isFavorited ? "default" : "outline"}
                      className="flex-1"
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-white' : ''}`} />
                      {isFavorited ? 'Favorited' : 'Favorite'}
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-primary-500">Creator</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" />
                          <AvatarFallback>{podcast.creator.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-primary-900">{podcast.creator}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-primary-500">Category</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {podcast.categories.map(category => (
                          <span key={category} className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-primary-500">Total Episodes</h3>
                      <p className="text-primary-900 mt-1">{podcast.totalEpisodes}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-primary-900">{podcast.title}</h1>
                <p className="text-primary-600 mt-2">By {podcast.creator}</p>
                
                <Tabs defaultValue="about" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="episodes">Episodes</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-4 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-primary-900">Description</h2>
                      <p className="mt-2 text-primary-700 whitespace-pre-line">
                        {podcast.description}
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold text-primary-900">About the Creator</h2>
                      <div className="flex items-start gap-4 mt-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" />
                          <AvatarFallback>{podcast.creator.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-primary-900">{podcast.creator}</h3>
                          <p className="mt-1 text-primary-700">
                            Creator of {podcast.title} and passionate about sharing knowledge in {podcast.categories.join(', ')}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="episodes" className="mt-4">
                    <h2 className="text-xl font-semibold text-primary-900 mb-4">Episodes</h2>
                    
                    {episodes.length > 0 ? (
                      <div className="space-y-4">
                        {episodes.map((episode) => (
                          <Card key={episode.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 flex flex-col md:flex-row gap-4">
                              <div className="md:w-3/4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-primary-900">{episode.title}</h3>
                                  {episode.isExclusive && (
                                    <span className="inline-block px-2 py-0.5 bg-accent-pink/90 text-white text-xs font-medium rounded-full">
                                      Exclusive
                                    </span>
                                  )}
                                </div>
                                
                                <p className="mt-2 text-primary-700 text-sm line-clamp-2">
                                  {episode.description}
                                </p>
                                
                                <div className="mt-3 flex items-center text-xs text-primary-500 gap-4">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDuration(episode.duration)}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(episode.releaseDate)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="md:w-1/4 flex md:justify-end items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePlay(episode)}
                                  className="flex-1 md:flex-none"
                                >
                                  {currentEpisode?.id === episode.id && isPlaying ? (
                                    <Pause className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  {currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                                </Button>
                                
                                <Button size="icon" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-primary-500">
                        No episodes available for this podcast.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-4">
                    <h2 className="text-xl font-semibold text-primary-900 mb-4">Reviews</h2>
                    <div className="text-center py-12 text-primary-500">
                      No reviews available for this podcast yet.
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-primary-900">Podcast Not Found</h1>
            <p className="mt-2 text-primary-600">
              The podcast you are looking for could not be found.
            </p>
            <Button asChild className="mt-6">
              <Link to="/discover">Discover Podcasts</Link>
            </Button>
          </div>
        )}
      </main>
      
      {currentEpisode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              
              <div>
                <p className="font-medium text-primary-900">{currentEpisode.title}</p>
                <p className="text-sm text-primary-600">{podcast?.title}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-primary-500">{formatDuration(currentEpisode.duration)}</p>
            </div>
          </div>
        </div>
      )}
      
      <AppFooter />
    </div>
  );
};

export default PodcastDetails;
