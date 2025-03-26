
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import Player from '@/components/Player';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Crown, 
  ArrowLeft, 
  Hash, 
  Send,
  Settings,
  PlusCircle,
  Mic,
  MicOff,
  Video,
  Volume,
  VolumeX,
  MessageSquare
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
}

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
  messages?: Record<string, Message[]>;
}

const RoomChannel = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get or create channel messages
  const getChannelMessages = (room: Room, channel: string): Message[] => {
    if (!room.messages) {
      room.messages = {};
    }
    if (!room.messages[channel]) {
      room.messages[channel] = [];
    }
    return room.messages[channel];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You need to be logged in to view this room');
      navigate('/login');
      return;
    }

    const fetchRoom = () => {
      setIsLoading(true);
      try {
        const storedRooms = JSON.parse(localStorage.getItem('podcastRooms') || '[]');
        const foundRoom = storedRooms.find((r: any) => r.id === roomId);
        
        if (foundRoom) {
          // Convert dates and ensure channels exist
          const processedRoom = {
            ...foundRoom,
            createdAt: new Date(foundRoom.createdAt),
            channels: foundRoom.channels || ['general'],
            messages: foundRoom.messages || {}
          };
          
          setRoom(processedRoom);
          
          // Get messages for the active channel
          const channelMessages = getChannelMessages(processedRoom, activeChannel);
          setMessages(channelMessages);
        } else {
          toast.error('Room not found');
          navigate('/rooms');
        }
      } catch (error) {
        console.error('Error loading room:', error);
        toast.error('Failed to load room details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoom();
  }, [roomId, isAuthenticated, navigate, activeChannel]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !room) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Anonymous User',
      userAvatar: user?.profileImage || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
      content: message.trim(),
      timestamp: new Date()
    };
    
    // Create a new room object with the updated messages
    const updatedRoom = { ...room };
    const channelMessages = getChannelMessages(updatedRoom, activeChannel);
    updatedRoom.messages = {
      ...updatedRoom.messages,
      [activeChannel]: [...channelMessages, newMessage]
    };
    
    // Update localStorage
    const storedRooms = JSON.parse(localStorage.getItem('podcastRooms') || '[]');
    const updatedRooms = storedRooms.map((r: any) => 
      r.id === room.id ? updatedRoom : r
    );
    localStorage.setItem('podcastRooms', JSON.stringify(updatedRooms));
    
    // Update state
    setRoom(updatedRoom);
    setMessages([...channelMessages, newMessage]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChannelChange = (channel: string) => {
    setActiveChannel(channel);
    
    if (room) {
      const channelMessages = getChannelMessages(room, channel);
      setMessages(channelMessages);
    }
  };

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-100 animate-pulse"></div>
        </div>
        <AppFooter />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow pt-24 md:pt-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Room Not Found</h1>
            <p className="mb-6 text-gray-600">This room may have been deleted or you don't have access to it.</p>
            <Button asChild>
              <Link to="/rooms">Go Back to Rooms</Link>
            </Button>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-20 px-0">
        <div className="max-w-screen-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
          {/* Room Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <Link to="/rooms">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-xl font-bold">{room.name}</h1>
              {room.isLive && (
                <Badge variant="destructive" className="ml-2 px-2 py-1 bg-red-500">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 hidden md:flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{room.memberCount} members</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-grow overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-primary">
                    <AvatarImage src={room.creatorAvatar} />
                    <AvatarFallback>{room.creatorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium">{room.creatorName}</span>
                      <Crown className="h-3 w-3 text-yellow-500 ml-1" />
                    </div>
                    <p className="text-xs text-gray-500">Creator</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase text-gray-500">Channels</h3>
                  {user?.id === room.creatorId && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <PlusCircle className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1">
                  {room.channels.map((channel) => (
                    <Button 
                      key={channel} 
                      variant={activeChannel === channel ? "secondary" : "ghost"} 
                      className="w-full justify-start text-sm h-8 px-2"
                      onClick={() => handleChannelChange(channel)}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      {channel}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase text-gray-500">Voice</h3>
                  </div>
                  
                  <Button 
                    variant={audioEnabled ? "secondary" : "ghost"} 
                    className="w-full justify-start text-sm h-8 px-2"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? (
                      <Mic className="h-4 w-4 mr-2" />
                    ) : (
                      <MicOff className="h-4 w-4 mr-2" />
                    )}
                    Voice Chat
                  </Button>
                  
                  <Button 
                    variant={videoEnabled ? "secondary" : "ghost"} 
                    className="w-full justify-start text-sm h-8 px-2 mt-1"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video Chat
                  </Button>
                </div>
              </div>
              
              <div className="mt-auto p-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {audioEnabled ? (
                      <Volume className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Chat area */}
            <div className="flex-grow flex flex-col">
              <div className="p-2 border-b flex items-center">
                <Hash className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium">{activeChannel}</span>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-800">No messages yet</h3>
                    <p className="text-gray-500">Be the first to send a message in #{activeChannel}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex group">
                      <Avatar className="h-8 w-8 mr-3 mt-0.5">
                        <AvatarImage src={msg.userAvatar} />
                        <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-baseline">
                          <span className="font-medium text-gray-900 mr-2">{msg.userName}</span>
                          <span className="text-xs text-gray-500">{formatMessageTime(new Date(msg.timestamp))}</span>
                        </div>
                        <p className="text-gray-800 break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Message #${activeChannel}`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow"
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AppFooter />
      <Player podcastId={null} />
    </div>
  );
};

export default RoomChannel;
