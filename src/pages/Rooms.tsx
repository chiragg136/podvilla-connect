
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import Player from '@/components/Player';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Crown, 
  MessageSquare, 
  RefreshCw, 
  PlusCircle,
  Hash,
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '@/components/CreateRoomModal';

interface Room {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  memberCount: number;
  isLive: boolean;
  tags: string[];
  channels: string[];
  createdAt: Date;
}

const Rooms = () => {
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        // Get rooms from localStorage
        const storedRooms = localStorage.getItem('podcastRooms');
        let availableRooms: Room[] = [];
        
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);
          // Convert string dates back to Date objects and ensure channels exist
          availableRooms = parsedRooms.map((room: any) => ({
            ...room,
            createdAt: new Date(room.createdAt),
            channels: room.channels || ['general'] // Ensure channels exist
          }));
        }
        
        // If no stored rooms or first load, provide mock data
        if (availableRooms.length === 0) {
          availableRooms = [
            {
              id: '1',
              name: 'Tech Enthusiasts Discussion',
              description: 'A community for tech enthusiasts to discuss the latest innovations',
              creatorId: 'creator1',
              creatorName: 'James Wilson',
              creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 24,
              isLive: true,
              tags: ['AI', 'Robotics', 'Coding'],
              channels: ['general', 'ai-discussion', 'project-showcase'],
              createdAt: new Date(Date.now() - 7200000), // 2 hours ago
            },
            {
              id: '2',
              name: 'Beginner-Friendly Tech Chat',
              description: 'A welcoming space for beginners to learn about technology',
              creatorId: 'creator2',
              creatorName: 'Emily Chen',
              creatorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 12,
              isLive: true,
              tags: ['Beginners', 'Learning', 'Q&A'],
              channels: ['general', 'questions', 'resources'],
              createdAt: new Date(Date.now() - 10800000), // 3 hours ago
            },
            {
              id: '3',
              name: 'Future of Tech Debate',
              description: 'Debates about where technology is headed in the next decade',
              creatorId: 'creator3',
              creatorName: 'Daniel Brown',
              creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 45,
              isLive: false,
              tags: ['Future', 'Ethics', 'Discussion'],
              channels: ['general', 'ethics', 'predictions', 'policy'],
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            }
          ];
          
          // Store the mock data for future use
          localStorage.setItem('podcastRooms', JSON.stringify(availableRooms));
        }
        
        setRooms(availableRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, [refreshKey]);
  
  const handleJoinRoom = (roomId: string, roomName: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to join a room');
      navigate('/login');
      return;
    }
    
    // Navigate to the room page
    navigate(`/rooms/${roomId}`);
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `Started ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `Started ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `Started ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just started';
    }
  };

  const handleRefresh = () => {
    setRefreshKey(old => old + 1);
    toast.info('Refreshing rooms...');
  };

  const handleRoomCreated = () => {
    setRefreshKey(old => old + 1);
  };

  const filteredRooms = activeTab === 'all' 
    ? rooms 
    : activeTab === 'live' 
      ? rooms.filter(room => room.isLive) 
      : rooms.filter(room => !room.isLive);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-2">
                Discussion Rooms
              </h1>
              <p className="text-primary-600">Join podcast discussion rooms and connect with other listeners</p>
            </div>

            {isAuthenticated && (
              <CreateRoomModal podcastTitle="New Room" onRoomCreated={handleRoomCreated} />
            )}
          </div>

          <div className="mb-8">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Rooms</TabsTrigger>
                <TabsTrigger value="live">Live Now</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">{filteredRooms.length} Available Rooms</h3>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse mb-6">
                <CardHeader className="pb-2">
                  <div className="h-6 w-2/3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRooms.length > 0 ? (
            <div className="space-y-6">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{room.name}</CardTitle>
                      {room.isLive && (
                        <Badge variant="destructive" className="px-2 py-1 bg-red-500">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{formatDate(room.createdAt)}</CardDescription>
                    {room.description && (
                      <p className="text-sm text-gray-600 mt-2">{room.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage src={room.creatorAvatar} alt={room.creatorName} />
                          <AvatarFallback>{room.creatorName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{room.creatorName}</span>
                            <Crown className="h-3 w-3 text-yellow-500" />
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{room.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 my-2 md:my-0">
                        {(room.channels || ['general']).slice(0, 3).map((channel) => (
                          <Badge key={channel} variant="outline" className="bg-gray-100 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {channel}
                          </Badge>
                        ))}
                        {(room.channels || ['general']).length > 3 && (
                          <Badge variant="outline" className="bg-gray-100">
                            +{(room.channels || ['general']).length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 my-2 md:my-0">
                        {room.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-gray-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => handleJoinRoom(room.id, room.name)}
                        className={room.isLive ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        {room.isLive ? (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Join Now
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Enter Room
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
              <p className="text-gray-500 mb-6">Be the first to create a room!</p>
              {isAuthenticated ? (
                <Button onClick={() => setActiveTab('all')} className="bg-primary-900">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a Room
                </Button>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  Login to Create a Room
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      <AppFooter />
      <Player podcastId={null} />
    </div>
  );
};

export default Rooms;
