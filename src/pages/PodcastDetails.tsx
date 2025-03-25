
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Pause, Heart, Share2, MessageSquare, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';
import EpisodeComments from '@/components/EpisodeComments';
import PodcastRoom from '@/components/PodcastRoom';

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
  const [activeTab, setActiveTab] = useState("details");
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [roomName, setRoomName] = useState('');

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

  const handleCreateRoom = () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a room.');
      return;
    }
    
    if (!roomName.trim()) {
      toast.error('Please enter a room name.');
      return;
    }
    
    // Simulate room creation
    toast.success(`Room "${roomName}" created successfully!`);
    setShowRoomDialog(false);
    setActiveTab("rooms");
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
          <div className="space-y-6">
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
                <div className="flex justify-between items-center flex-wrap gap-4">
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
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={handleFavorite}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorite
                    </Button>
                    <Button variant="outline" onClick={handleSubscribe}>
                      Subscribe
                    </Button>
                    <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Users className="mr-2 h-4 w-4" />
                          Create Room
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a Podcast Room</DialogTitle>
                          <DialogDescription>
                            Create a room to discuss this podcast with other listeners
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="roomName" className="text-sm font-medium">
                              Room Name
                            </label>
                            <Input
                              id="roomName"
                              value={roomName}
                              onChange={(e) => setRoomName(e.target.value)}
                              placeholder="Enter a name for your room"
                            />
                          </div>
                          <Button onClick={handleCreateRoom} className="w-full">
                            Create Room
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="secondary">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="discussions">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="rooms">
                  <Users className="mr-2 h-4 w-4" />
                  Rooms
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Podcast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {podcast.description}
                    </p>
                    <div className="mt-4">
                      <h3 className="font-medium">Creator</h3>
                      <div className="flex items-center mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={podcast.creator} />
                          <AvatarFallback>{podcast.creator[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <p className="text-sm font-medium">{podcast.creator}</p>
                          <p className="text-sm text-gray-500">Podcast Host</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussions">
                <EpisodeComments podcastId={id || ''} />
              </TabsContent>
              
              <TabsContent value="rooms">
                <PodcastRoom podcastId={id || ''} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default PodcastDetails;
