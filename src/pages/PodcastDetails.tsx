
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Play, Pause, Bookmark, Share, Download, Clock, Calendar, MessageSquare, Users, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { podcastService, Podcast, Episode } from '@/services/podcastService';
import { useUser } from '@/contexts/UserContext';
import Player from '@/components/Player';
import EpisodeComments from '@/components/EpisodeComments';
import PodcastRoom from '@/components/PodcastRoom';
import { getPlayableAudioUrl, getDisplayableImageUrl, getGoogleDriveDownloadLink } from '@/utils/mediaUtils';
import { getPodcastMetadata } from '@/utils/googleDriveStorage';
import { deletePodcastWithFiles, deleteEpisode } from '@/utils/fileDeleteUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PodcastDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAuthenticated } = useUser();
  const [activeTab, setActiveTab] = useState('episodes');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);
  const [isUserOwned, setIsUserOwned] = useState(false);
  const [deleteEpisodeId, setDeleteEpisodeId] = useState<string | null>(null);
  const [deletePodcastDialogOpen, setDeletePodcastDialogOpen] = useState(false);

  useEffect(() => {
    fetchPodcastDetails();
  }, [id, isAuthenticated]);

  const fetchPodcastDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // First check if it's a user-uploaded podcast in localStorage
      const userPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
      const userPodcast = userPodcasts.find((p: any) => p.id === id);
      
      if (userPodcast) {
        console.log("Found user-uploaded podcast:", userPodcast);
        setIsUserOwned(true);
        
        const coverImageUrl = getDisplayableImageUrl(userPodcast.coverImage);
        
        const formattedPodcast: Podcast = {
          id: userPodcast.id,
          title: userPodcast.title,
          description: userPodcast.description,
          creator: userPodcast.creator || 'You',
          coverImage: coverImageUrl,
          categories: [userPodcast.category],
          totalEpisodes: userPodcast.episodes?.length || 0
        };
        
        setPodcast(formattedPodcast);
        
        if (userPodcast.episodes && userPodcast.episodes.length > 0) {
          const formattedEpisodes = userPodcast.episodes.map((ep: any) => ({
            id: ep.id,
            podcastId: userPodcast.id,
            title: ep.title,
            description: ep.description,
            audioUrl: getPlayableAudioUrl(ep.audioUrl),
            audioFileId: ep.audioFileId,
            duration: ep.duration ? parseInt(ep.duration) : 300,
            releaseDate: ep.createdAt || new Date().toISOString(),
            isExclusive: false
          }));
          
          setEpisodes(formattedEpisodes);
        }
      } else {
        // Check Google Drive storage
        const googleDrivePodcasts = await getPodcastMetadata();
        const googleDrivePodcast = googleDrivePodcasts.find((p: any) => p.id === id);
        
        if (googleDrivePodcast) {
          console.log("Found podcast in Google Drive:", googleDrivePodcast);
          
          const coverImageUrl = getDisplayableImageUrl(googleDrivePodcast.coverImage);
          
          const formattedPodcast: Podcast = {
            id: googleDrivePodcast.id,
            title: googleDrivePodcast.title,
            description: googleDrivePodcast.description,
            creator: googleDrivePodcast.userId || 'Unknown Creator',
            coverImage: coverImageUrl,
            categories: [googleDrivePodcast.category],
            totalEpisodes: googleDrivePodcast.episodes?.length || 0
          };
          
          setPodcast(formattedPodcast);
          
          if (googleDrivePodcast.episodes && googleDrivePodcast.episodes.length > 0) {
            const formattedEpisodes = googleDrivePodcast.episodes.map((ep: any) => ({
              id: ep.id,
              podcastId: googleDrivePodcast.id,
              title: ep.title,
              description: ep.description,
              audioUrl: getPlayableAudioUrl(ep.audioUrl),
              audioFileId: ep.audioFileId,
              duration: ep.duration ? parseInt(ep.duration) : 300,
              releaseDate: ep.createdAt,
              isExclusive: false
            }));
            
            setEpisodes(formattedEpisodes);
          }
        } else {
          // Finally, check Supabase
          const podcastData = await podcastService.getPodcastById(id);
          
          if (podcastData) {
            const processedPodcast = {
              ...podcastData,
              coverImage: getDisplayableImageUrl(podcastData.coverImage)
            };
            
            setPodcast(processedPodcast);
            
            const episodesData = await podcastService.getEpisodesByPodcastId(id);
            
            const processedEpisodes = episodesData.map(episode => ({
              ...episode,
              audioUrl: getPlayableAudioUrl(episode.audioUrl)
            }));
            
            setEpisodes(processedEpisodes);
            
            if (isAuthenticated) {
              const favoriteStatus = await podcastService.isPodcastFavorited(id);
              setIsFavorite(favoriteStatus);
            }
          } else {
            toast.error('Podcast not found');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching podcast details:', error);
      toast.error('Failed to load podcast details');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    
    try {
      const newStatus = await podcastService.toggleFavoritePodcast(id);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handlePlayEpisode = async (episode: Episode) => {
    const directUrl = getPlayableAudioUrl(episode.audioUrl);
    console.log("Playing episode:", { title: episode.title, url: directUrl });
    setCurrentAudioUrl(directUrl);
    
    if (currentEpisode && currentEpisode.id === episode.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const downloadEpisode = async (episode: Episode) => {
    if (!isAuthenticated) {
      toast.error('Please login to download episodes');
      return;
    }
    
    try {
      let downloadUrl = episode.audioUrl;
      
      if (episode.audioFileId) {
        downloadUrl = getGoogleDriveDownloadLink(episode.audioFileId);
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${episode.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      await podcastService.addDownload(episode.id);
      toast.success('Episode downloaded for offline listening');
    } catch (error) {
      console.error('Error downloading episode:', error);
      toast.error('Failed to download episode');
    }
  };

  const shareEpisode = (episode: Episode) => {
    if (navigator.share) {
      navigator.share({
        title: episode.title,
        text: episode.description,
        url: window.location.href + '?episode=' + episode.id
      }).catch(err => {
        console.error("Share failed:", err);
        copyToClipboard(episode);
      });
    } else {
      copyToClipboard(episode);
    }
  };
  
  const copyToClipboard = (episode: Episode) => {
    navigator.clipboard.writeText(window.location.href + '?episode=' + episode.id)
      .then(() => {
        toast.success('Link copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!id) return;
    
    setDeleteEpisodeId(null);
    const success = await deleteEpisode(id, episodeId);
    
    if (success) {
      // Stop playback if this was the currently playing episode
      if (currentEpisode && currentEpisode.id === episodeId) {
        setCurrentEpisode(null);
        setIsPlaying(false);
      }
      
      // Refresh podcast details
      fetchPodcastDetails();
    }
  };

  const handleDeletePodcast = async () => {
    if (!id) return;
    
    setDeletePodcastDialogOpen(false);
    const success = await deletePodcastWithFiles(id);
    
    if (success) {
      toast.success('Podcast deleted successfully');
      navigate('/discover');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink animate-pulse-slow"></div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <h2 className="text-2xl font-bold mb-4">Podcast Not Found</h2>
          <p className="text-primary-600 mb-6">The podcast you're looking for doesn't exist or has been removed.</p>
          <Link to="/discover">
            <Button>Browse Podcasts</Button>
          </Link>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link to="/discover" className="inline-flex items-center text-primary-600 hover:text-primary-900 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="aspect-square rounded-xl overflow-hidden">
            {podcast && (
              <img 
                src={podcast.coverImage} 
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder.svg';
                }}
              />
            )}
          </div>
          
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {podcast.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="bg-primary-50">
                  {category}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-2">
              {podcast.title}
            </h1>
            
            <div className="flex items-center mb-4">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>{podcast.creator[0]}</AvatarFallback>
              </Avatar>
              <span className="text-primary-700">{podcast.creator}</span>
            </div>
            
            <p className="text-primary-600 mb-6">
              {podcast.description}
            </p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                onClick={() => episodes.length > 0 && handlePlayEpisode(episodes[0])}
                disabled={episodes.length === 0}
                className="bg-accent-purple hover:bg-accent-purple-dark"
              >
                {isPlaying && currentEpisode === episodes[0] ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isPlaying && currentEpisode === episodes[0] ? 'Pause' : 'Play Latest'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={toggleFavorite}
                className={isFavorite ? "bg-primary-50" : ""}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isFavorite ? "fill-accent-purple text-accent-purple" : ""}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
              
              {isUserOwned && (
                <AlertDialog open={deletePodcastDialogOpen} onOpenChange={setDeletePodcastDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Podcast
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete this podcast
                        and all its episodes from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeletePodcast}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <div className="flex items-center text-sm text-primary-500">
              <div className="flex items-center mr-4">
                <MessageSquare className="mr-1 h-4 w-4" />
                {podcast.totalEpisodes} episodes
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="episodes" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="space-y-4">
            {episodes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-primary-600">No episodes available yet.</p>
                </CardContent>
              </Card>
            ) : (
              episodes.map((episode) => (
                <Card key={episode.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{episode.title}</h3>
                        <p className="text-primary-600 text-sm mb-2">{episode.description}</p>
                        
                        <div className="flex flex-wrap text-xs text-primary-500 gap-x-4 gap-y-1">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(episode.duration)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(episode.releaseDate)}
                          </div>
                          {episode.isExclusive && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handlePlayEpisode(episode)}
                          className="bg-accent-purple hover:bg-accent-purple-dark"
                        >
                          {isPlaying && currentEpisode?.id === episode.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadEpisode(episode)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareEpisode(episode)}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        
                        {isUserOwned && (
                          <AlertDialog open={deleteEpisodeId === episode.id} onOpenChange={(open) => !open && setDeleteEpisodeId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setDeleteEpisodeId(episode.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete episode?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. It will permanently delete this episode and its audio file.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteEpisode(episode.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="discussions">
            <EpisodeComments podcastId={id || ''} />
          </TabsContent>
          
          <TabsContent value="rooms">
            <PodcastRoom podcastId={id || ''} podcastTitle={podcast.title} />
          </TabsContent>
        </Tabs>
      </main>
      
      <AppFooter />
      {currentEpisode && <Player 
        podcastId={id || ''} 
        episodeId={currentEpisode.id} 
        isPlaying={isPlaying} 
        audioUrl={currentAudioUrl}
      />}
    </div>
  );
};

export default PodcastDetails;
