import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';
import PodcastCard from '@/components/PodcastCard';
import { podcastService, Podcast } from '@/services/podcastService';
import { Upload, Music, Heart, Bookmark, History, Settings } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userPodcasts, setUserPodcasts] = useState<Podcast[]>([]);
  const [favoritePodcasts, setFavoritePodcasts] = useState<Podcast[]>([]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      loadUserContent();
    }
  }, [isAuthenticated, navigate]);
  
  const loadUserContent = async () => {
    setIsLoading(true);
    try {
      // This would fetch user's podcasts in a real app
      const allPodcasts = await podcastService.getAllPodcasts();
      // For demo, just use some random podcasts
      const randomPodcasts = allPodcasts.sort(() => Math.random() - 0.5).slice(0, 3);
      setUserPodcasts(randomPodcasts);
      
      // Get some random favorites
      const randomFavorites = allPodcasts.sort(() => Math.random() - 0.5).slice(0, 4);
      setFavoritePodcasts(randomFavorites);
    } catch (error) {
      console.error('Error loading user content:', error);
      toast.error('Failed to load content. Please try refreshing the page');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (!user) {
    return null; // Will redirect via the useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary-900">{user.name || user.email.split('@')[0]}</h1>
              <p className="text-primary-600">{user.email}</p>
              {user.walletAddress && (
                <p className="text-sm text-primary-500 mt-1">
                  {user.walletType === 'metamask' ? 'Metamask' : 'Dojima'} Wallet: {user.walletAddress.substring(0, 8)}...{user.walletAddress.substring(user.walletAddress.length - 6)}
                </p>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button asChild variant="default" className="flex items-center gap-2">
                  <Link to="/upload">
                    <Upload className="h-4 w-4" />
                    Upload Podcast
                  </Link>
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="podcasts" className="space-y-8">
            <TabsList className="w-full md:w-auto flex justify-start overflow-x-auto pb-2">
              <TabsTrigger value="podcasts" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                My Podcasts
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Playlists
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="podcasts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary-900">Your Podcasts</h2>
                <Button asChild variant="outline" size="sm">
                  <Link to="/upload">Upload New</Link>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userPodcasts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      id={podcast.id}
                      title={podcast.title}
                      creator={podcast.creator}
                      coverImage={podcast.coverImage}
                      duration={`${podcast.totalEpisodes} episodes`}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-primary-50 p-4 mb-4">
                      <Music className="h-10 w-10 text-primary-600" />
                    </div>
                    <CardTitle className="text-xl text-center">You haven't created any podcasts yet</CardTitle>
                    <CardDescription className="text-center mt-2">
                      Start uploading your first podcast to build your audience
                    </CardDescription>
                    <Button asChild className="mt-6">
                      <Link to="/upload">Upload Your First Podcast</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-6">
              <h2 className="text-xl font-semibold text-primary-900">Your Favorite Podcasts</h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : favoritePodcasts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favoritePodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      id={podcast.id}
                      title={podcast.title}
                      creator={podcast.creator}
                      coverImage={podcast.coverImage}
                      duration={`${podcast.totalEpisodes} episodes`}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-primary-50 p-4 mb-4">
                      <Heart className="h-10 w-10 text-primary-600" />
                    </div>
                    <CardTitle className="text-xl text-center">No favorite podcasts yet</CardTitle>
                    <CardDescription className="text-center mt-2">
                      Browse podcasts and favorite the ones you love
                    </CardDescription>
                    <Button asChild className="mt-6">
                      <Link to="/discover">Discover Podcasts</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="playlists">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary-50 p-4 mb-4">
                    <Bookmark className="h-10 w-10 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl text-center">Create your first playlist</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Organize episodes into playlists for easier listening
                  </CardDescription>
                  <Button className="mt-6">Create Playlist</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary-50 p-4 mb-4">
                    <History className="h-10 w-10 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl text-center">Your listening history is empty</CardTitle>
                  <CardDescription className="text-center mt-2">
                    Start listening to podcasts to build your history
                  </CardDescription>
                  <Button asChild className="mt-6">
                    <Link to="/discover">Discover Podcasts</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your profile and account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary-600">Account settings functionality coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Profile;
