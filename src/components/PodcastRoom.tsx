
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from './CreateRoomModal';

interface Room {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  memberCount: number;
  isLive: boolean;
  tags: string[];
  createdAt: Date;
}

interface PodcastRoomProps {
  podcastId: string;
  podcastTitle: string;
}

const PodcastRoom = ({ podcastId, podcastTitle }: PodcastRoomProps) => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        // Get rooms from localStorage
        const storedRooms = localStorage.getItem('podcastRooms');
        let availableRooms: Room[] = [];
        
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);
          // Convert string dates back to Date objects
          availableRooms = parsedRooms.map((room: any) => ({
            ...room,
            createdAt: new Date(room.createdAt)
          }));
        }
        
        // If no stored rooms or first load, provide mock data
        if (availableRooms.length === 0) {
          availableRooms = [
            {
              id: '1',
              name: 'Tech Enthusiasts Discussion',
              creatorId: 'creator1',
              creatorName: 'James Wilson',
              creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 24,
              isLive: true,
              tags: ['AI', 'Robotics', 'Coding'],
              createdAt: new Date(Date.now() - 7200000), // 2 hours ago
            },
            {
              id: '2',
              name: 'Beginner-Friendly Tech Chat',
              creatorId: 'creator2',
              creatorName: 'Emily Chen',
              creatorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 12,
              isLive: true,
              tags: ['Beginners', 'Learning', 'Q&A'],
              createdAt: new Date(Date.now() - 10800000), // 3 hours ago
            },
            {
              id: '3',
              name: 'Future of Tech Debate',
              creatorId: 'creator3',
              creatorName: 'Daniel Brown',
              creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
              memberCount: 45,
              isLive: false,
              tags: ['Future', 'Ethics', 'Discussion'],
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
  }, [podcastId, refreshKey]);
  
  const handleJoinRoom = (roomId: string, roomName: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to join a room');
      navigate('/login');
      return;
    }
    
    // Simulate joining room
    toast.success(`Joined room: ${roomName}`);
    
    // In a real app, this would navigate to the room or open a modal
    console.log(`Joined room with ID: ${roomId}`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{rooms.length} Available Rooms</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
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
      ) : rooms.length > 0 ? (
        rooms.map((room) => (
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
                      <UserPlus className="mr-2 h-4 w-4" />
                      View Room
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Rooms Available</h3>
          <p className="text-gray-500 mb-6">Be the first to create a room for {podcastTitle}!</p>
          {isAuthenticated ? (
            <CreateRoomModal 
              podcastTitle={podcastTitle} 
              onRoomCreated={handleRoomCreated} 
            />
          ) : (
            <Button onClick={() => navigate('/login')}>
              Login to Create a Room
            </Button>
          )}
        </div>
      )}

      {rooms.length > 0 && isAuthenticated && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <CreateRoomModal 
            podcastTitle={podcastTitle} 
            onRoomCreated={handleRoomCreated} 
          />
        </div>
      )}
    </div>
  );
};

export default PodcastRoom;
