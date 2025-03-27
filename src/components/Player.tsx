import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume1, VolumeX, Heart, ListMusic, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { getGoogleDriveDownloadLink } from '@/utils/googleDriveStorage';

interface PlayerProps {
  isVisible?: boolean;
  podcastId?: string | null;
  episodeId?: string;
  isPlaying?: boolean;
  audioUrl?: string;
}

// Mock podcast data
const podcastData = {
  'featured-podcast': {
    title: 'The Daily Tech',
    creator: 'Tech Insights',
    coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 180
  },
  '1': {
    title: 'Design Matters with Anna',
    creator: 'Anna Roberts',
    coverImage: 'https://images.unsplash.com/photo-1599689018356-f4bae9bf4bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 240
  },
  '2': {
    title: 'Tech Today',
    creator: 'James Wilson',
    coverImage: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 192
  },
  '3': {
    title: 'The Future of AI',
    creator: 'Emily Chen',
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 330
  },
  '4': {
    title: 'Mindful Moments',
    creator: 'Sarah Johnson',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 168
  },
  '5': {
    title: 'Global Economics',
    creator: 'Michael Brown',
    coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 252
  },
  '6': {
    title: 'Creative Writing',
    creator: 'Lisa Morgan',
    coverImage: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    duration: 222
  }
};

// Mock episode data
const episodeData: Record<string, any> = {
  'ep1': { title: 'Introduction to Tech', duration: 240, audioUrl: 'https://example.com/audio1.mp3' },
  'ep2': { title: 'Advanced Programming', duration: 300, audioUrl: 'https://example.com/audio2.mp3' },
  'ep3': { title: 'Web Development Basics', duration: 180, audioUrl: 'https://example.com/audio3.mp3' },
  'ep4': { title: 'AI and Machine Learning', duration: 420, audioUrl: 'https://example.com/audio4.mp3' },
};

const Player = ({ 
  isVisible = true, 
  podcastId, 
  episodeId, 
  isPlaying: initialPlayState = false,
  audioUrl: propAudioUrl
}: PlayerProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(initialPlayState);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(240);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    audioRef.current.addEventListener('timeupdate', () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }
    });
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current && audioRef.current.duration) {
        setTotalDuration(audioRef.current.duration);
      }
    });
    
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
      }
    };
  }, []);

  // Set audio source
  useEffect(() => {
    // Check if we have a direct audio URL from props
    if (propAudioUrl) {
      setAudioSource(propAudioUrl);
      return;
    }
    
    // Otherwise try to get it from episode data
    if (episodeId && episodeData[episodeId]) {
      const audioSrc = episodeData[episodeId].audioUrl;
      setAudioSource(audioSrc);
      return;
    }
    
    // If we only have a podcast ID, set a dummy source
    if (podcastId) {
      const dummySource = `https://example.com/podcast/${podcastId}/audio.mp3`;
      setAudioSource(dummySource);
    }
  }, [podcastId, episodeId, propAudioUrl]);

  // Update audio element when source changes
  useEffect(() => {
    if (audioRef.current && audioSource) {
      audioRef.current.src = audioSource;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio:', error);
          toast({
            title: "Playback Error",
            description: "Could not play this audio. The file may not be accessible.",
          });
          setIsPlaying(false);
        });
      }
    }
  }, [audioSource, toast]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (podcastId && podcastData[podcastId as keyof typeof podcastData]) {
      setCurrentPodcast(podcastId);
      setShowPlayer(true);
      setIsPlaying(initialPlayState);
      setProgress(0);
      setCurrentTime(0);
      
      // Get total duration from podcast data as a fallback
      setTotalDuration(podcastData[podcastId as keyof typeof podcastData].duration);
      
      toast({
        title: "Now Playing",
        description: `${podcastData[podcastId as keyof typeof podcastData].title} by ${podcastData[podcastId as keyof typeof podcastData].creator}`,
      });
    }
  }, [podcastId, initialPlayState, toast]);

  useEffect(() => {
    setIsPlaying(initialPlayState);
  }, [initialPlayState]);

  useEffect(() => {
    setShowPlayer(isVisible);
  }, [isVisible]);

  // Handle episode-specific logic
  useEffect(() => {
    if (episodeId && episodeData[episodeId]) {
      // If we have an episode ID, use its duration
      setTotalDuration(episodeData[episodeId].duration);
    }
  }, [episodeId]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked 
        ? "Podcast removed from your favorites" 
        : "Podcast added to your favorites",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this podcast!",
        url: window.location.href
      }).catch(err => {
        console.error("Share failed:", err);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Podcast link copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy link to clipboard",
        });
      });
  };

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!showPlayer || !currentPodcast) return null;

  const podcast = podcastData[currentPodcast as keyof typeof podcastData] || {
    title: "Unknown Podcast",
    creator: "Unknown Creator",
    coverImage: "https://images.unsplash.com/photo-1599689018356-f4bae9bf4bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-500 ${
      showPlayer ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Podcast Info */}
          <div className="col-span-12 md:col-span-3 flex items-center">
            <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
              <img 
                src={podcast.coverImage}
                alt="Podcast cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-primary-900 truncate">{podcast.title}</h4>
              <p className="text-xs text-primary-600 truncate">{podcast.creator}</p>
            </div>
            <Button
              onClick={toggleLike}
              size="icon"
              variant="ghost"
              className="ml-3 text-primary-600 hover:text-primary-900 hidden md:flex"
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-accent-pink text-accent-pink' : ''}`} 
              />
            </Button>
          </div>

          {/* Player Controls */}
          <div className="col-span-12 md:col-span-6 flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-1 md:mb-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-600 hover:text-primary-900"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePlay}
                size="icon"
                className="bg-primary-900 hover:bg-primary-800 text-white rounded-full h-10 w-10"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-600 hover:text-primary-900"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="w-full flex items-center space-x-2">
              <span className="text-xs text-primary-500 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={0.01}
                onValueChange={handleProgressChange}
                className="flex-1"
              />
              <span className="text-xs text-primary-500 w-8">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="col-span-12 md:col-span-3 flex items-center justify-end space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="text-primary-600 hover:text-primary-900"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume1 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => {
                  setVolume(value[0]);
                  if (value[0] > 0) setIsMuted(false);
                }}
                className="w-24"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-600 hover:text-primary-900"
            >
              <ListMusic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-600 hover:text-primary-900"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
