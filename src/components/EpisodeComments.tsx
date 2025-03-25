
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

interface EpisodeCommentsProps {
  podcastId: string;
}

const EpisodeComments = ({ podcastId }: EpisodeCommentsProps) => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockComments = [
          {
            id: '1',
            userId: 'user1',
            userName: 'Alex Thompson',
            userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
            content: 'This episode was incredibly insightful! I especially enjoyed the discussion on quantum computing.',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Sarah Johnson',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
            content: 'I disagree with some points about AI ethics. I think there are more nuances to consider.',
            timestamp: new Date(Date.now() - 43200000), // 12 hours ago
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'Miguel Rodriguez',
            userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80',
            content: 'Just started listening to this podcast. Any recommendations for similar episodes?',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          }
        ];
        
        setComments(mockComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [podcastId]);
  
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Create new comment
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest User',
        userAvatar: user?.profileImage || 'https://via.placeholder.com/150',
        content: newComment,
        timestamp: new Date(),
      };
      
      // Update state with new comment
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    }
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={isAuthenticated ? (user?.profileImage || 'https://via.placeholder.com/150') : 'https://via.placeholder.com/150'} 
                alt="Your avatar" 
              />
              <AvatarFallback>{isAuthenticated ? (user?.name?.[0] || 'G') : 'G'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={isAuthenticated ? "Share your thoughts on this episode..." : "Login to comment"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isAuthenticated}
                className="resize-none min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleSubmitComment} 
                  disabled={!isAuthenticated || !newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{comment.userName}</h4>
                      <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeComments;
