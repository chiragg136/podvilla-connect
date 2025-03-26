
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, X, PlusCircle, Hash } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useUser } from '@/contexts/UserContext';

interface CreateRoomModalProps {
  podcastTitle: string;
  onRoomCreated: () => void;
}

const CreateRoomModal = ({ podcastTitle, onRoomCreated }: CreateRoomModalProps) => {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channels, setChannels] = useState<string[]>(['general']);
  const [currentChannel, setCurrentChannel] = useState('');
  const { user } = useUser();

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddChannel = () => {
    if (currentChannel.trim() && !channels.includes(currentChannel.trim())) {
      setChannels([...channels, currentChannel.trim()]);
      setCurrentChannel('');
    }
  };

  const handleRemoveChannel = (channelToRemove: string) => {
    if (channelToRemove === 'general') return; // Don't remove general channel
    setChannels(channels.filter(channel => channel !== channelToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'tag' | 'channel') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tag') {
        handleAddTag();
      } else {
        handleAddChannel();
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a unique ID for the room
      const roomId = `room_${Date.now()}`;
      
      // Create the room object
      const newRoom = {
        id: roomId,
        name: roomName.trim(),
        description: roomDescription.trim(),
        creatorId: user?.id || 'unknown',
        creatorName: user?.name || 'Anonymous User',
        creatorAvatar: user?.profileImage || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        memberCount: 1, // Start with the creator
        isLive: true,
        tags: [...tags],
        channels: [...channels],
        createdAt: new Date(),
      };
      
      // Store the room in localStorage for persistence between refreshes
      const existingRooms = JSON.parse(localStorage.getItem('podcastRooms') || '[]');
      localStorage.setItem('podcastRooms', JSON.stringify([...existingRooms, newRoom]));

      toast.success('Room created successfully!');
      
      // Reset form
      setRoomName('');
      setRoomDescription('');
      setTags([]);
      setChannels(['general']);
      setIsPrivate(false);
      
      // Close the modal
      setOpen(false);
      
      // Notify parent component
      onRoomCreated();
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Discussion Room</DialogTitle>
          <DialogDescription>
            Create a room to discuss {podcastTitle !== "New Room" ? `"${podcastTitle}"` : "podcasts"} with other listeners
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-name" className="text-right">
              Room Name
            </Label>
            <Input
              id="room-name"
              placeholder="Tech Enthusiasts Discussion"
              className="col-span-3"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-desc" className="text-right">
              Description
            </Label>
            <Textarea
              id="room-desc"
              placeholder="What will this room be about?"
              className="col-span-3"
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-channels" className="text-right">
              Channels
            </Label>
            <div className="col-span-3">
              <div className="flex gap-2 mb-2 flex-wrap">
                {channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="bg-gray-100 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {channel}
                    {channel !== 'general' && (
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveChannel(channel)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="room-channels"
                  placeholder="Add channel (e.g., gaming, music)"
                  value={currentChannel}
                  onChange={(e) => setCurrentChannel(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'channel')}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddChannel}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-tags" className="text-right">
              Tags
            </Label>
            <div className="col-span-3">
              <div className="flex gap-2 mb-2 flex-wrap">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-gray-100 flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="room-tags"
                  placeholder="Add tags (e.g., Tech, AI)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'tag')}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRoom}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
