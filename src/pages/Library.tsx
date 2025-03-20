
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Player from '@/components/Player';
import AppFooter from '@/components/AppFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Clock, Download, Heart, History, List, ListMusic, PlayCircle, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import { podcastService, Podcast, Episode } from '@/services/podcastService';

const EmptyState = ({ title, description, icon: Icon, actionText, onAction }: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  actionText?: string;
  onAction?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
      <Icon className="h-8 w-8 text-primary-600" />
    </div>
    <h3 className="text-xl font-medium text-primary-900 mb-2">{title}</h3>
    <p className="text-primary-600 max-w-md mb-6">{description}</p>
    {actionText && onAction && (
      <Button onClick={onAction} className="bg-primary-900">
        {actionText}
      </Button>
    )}
  </div>
);

const Library = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("favorites");
  const [favorites, setFavorites] = useState<Podcast[]>([]);
  const [history, setHistory] = useState<Episode[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<Episode[]>([]);
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your library",
      });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, toast]);

  useEffect(() => {
    const loadLibraryData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      
      try {
        // Fetch user library data
        const libraryData = await podcastService.getUserLibrary();
        
        // Load favorite podcasts
        const favPodcasts: Podcast[] = [];
        for (const id of libraryData.favoriteIds) {
          const podcast = await podcastService.getPodcastById(id);
          if (podcast) favPodcasts.push(podcast);
        }
        setFavorites(favPodcasts);
        
        // Load history
        const historyEpisodes: Episode[] = [];
        for (const item of libraryData.listeningHistory) {
          const episode = await podcastService.getEpisodeById(item.episodeId);
          if (episode) historyEpisodes.push(episode);
        }
        setHistory(historyEpisodes);
        
        // Set playlists
        setPlaylists(libraryData.playlists);
        
        // Load downloads
        const downloadedEpisodes: Episode[] = [];
        for (const id of libraryData.downloads) {
          const episode = await podcastService.getEpisodeById(id);
          if (episode) downloadedEpisodes.push(episode);
        }
        setDownloads(downloadedEpisodes);
      } catch (error) {
        console.error('Error loading library data:', error);
        toast({
          title: "Error",
          description: "Failed to load your library data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraryData();
  }, [isAuthenticated, toast]);

  const handlePlayEpisode = (episodeId: string) => {
    // In a real app, this would play the episode
    console.log(`Playing episode: ${episodeId}`);
  };

  const handleDownload = (episodeId: string) => {
    podcastService.addDownload(episodeId).then(() => {
      // Refresh downloads
      const updatedDownloads = [...downloads];
      setDownloads(updatedDownloads);
    });
  };

  const handleBrowsePodcasts = () => {
    navigate('/discover');
  };

  if (authLoading || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-2">
              Your Library
            </h1>
            <p className="text-primary-600">Manage your podcasts and listening history</p>
          </div>
          
          <Tabs defaultValue="favorites" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="favorites" className="font-medium">
                <Heart className="h-4 w-4 mr-2" /> Favorites
              </TabsTrigger>
              <TabsTrigger value="history" className="font-medium">
                <History className="h-4 w-4 mr-2" /> History
              </TabsTrigger>
              <TabsTrigger value="playlists" className="font-medium">
                <ListMusic className="h-4 w-4 mr-2" /> Playlists
              </TabsTrigger>
              <TabsTrigger value="downloads" className="font-medium">
                <Download className="h-4 w-4 mr-2" /> Downloads
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites">
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                  {favorites.map(podcast => (
                    <div key={podcast.id} className="hover-scale subtle-ring image-shine">
                      <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                        <div className="aspect-square">
                          <img 
                            src={podcast.coverImage} 
                            alt={podcast.title}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-primary-900 truncate">{podcast.title}</h3>
                          <p className="text-sm text-primary-600 truncate">{podcast.creator}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-primary-500">{podcast.totalEpisodes} episodes</span>
                            <Button 
                              size="sm" 
                              className="bg-primary-900 text-white rounded-full p-1 h-8 w-8"
                              onClick={() => setCurrentPodcastId(podcast.id)}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No favorites yet" 
                  description="Like episodes and podcasts to access them quickly here."
                  icon={Heart}
                  actionText="Browse Podcasts"
                  onAction={handleBrowsePodcasts}
                />
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {history.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-primary-900">Recently Played</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {history.map((episode) => (
                      <div key={episode.id} className="p-4 hover:bg-gray-50 flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                          <img 
                            src={`https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                            alt="Podcast cover" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-primary-900 truncate">{episode.title}</h4>
                          <p className="text-sm text-primary-600 truncate">
                            From: {episode.podcastId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-primary-500 whitespace-nowrap flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {Math.floor(episode.duration / 60)} min
                          </span>
                          <Button variant="ghost" size="icon" className="text-primary-600" onClick={() => handleDownload(episode.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary-600"
                            onClick={() => handlePlayEpisode(episode.id)}
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No listening history yet" 
                  description="Episodes you play will appear here."
                  icon={History}
                  actionText="Browse Podcasts"
                  onAction={handleBrowsePodcasts}
                />
              )}
            </TabsContent>
            
            <TabsContent value="playlists">
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium text-primary-900">{playlist.name}</h3>
                        <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                          {playlist.episodeIds.length} episodes
                        </span>
                      </div>
                      <div className="p-4">
                        <Button className="w-full bg-primary-900">
                          <PlayCircle className="h-4 w-4 mr-2" /> Play Playlist
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center p-8">
                    <Plus className="h-10 w-10 text-primary-300 mb-4" />
                    <h3 className="font-medium text-primary-900 mb-2">Create New Playlist</h3>
                    <p className="text-sm text-primary-600 text-center mb-4">
                      Organize your favorite episodes into custom playlists
                    </p>
                    <Button className="bg-primary-900">
                      Create Playlist
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No playlists yet" 
                  description="Create playlists to organize your favorite episodes."
                  icon={List}
                  actionText="Create Playlist"
                  onAction={() => toast.success("Create playlist feature coming soon!")}
                />
              )}
            </TabsContent>
            
            <TabsContent value="downloads">
              {downloads.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-primary-900">Downloaded Episodes</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {downloads.map((episode) => (
                      <div key={episode.id} className="p-4 hover:bg-gray-50 flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                          <img 
                            src={`https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                            alt="Podcast cover" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-primary-900 truncate">{episode.title}</h4>
                          <p className="text-sm text-primary-600 truncate">
                            {episode.description.substring(0, 60)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-primary-500 whitespace-nowrap flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {Math.floor(episode.duration / 60)} min
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary-600"
                            onClick={() => handlePlayEpisode(episode.id)}
                          >
                            <PlayCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No downloads yet" 
                  description="Download episodes to listen offline anytime, anywhere."
                  icon={Download}
                  actionText="Browse Podcasts"
                  onAction={handleBrowsePodcasts}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
      <Player podcastId={currentPodcastId} />
    </div>
  );
};

export default Library;
