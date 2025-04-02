import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume1, VolumeX, Heart, ListMusic, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { getPlayableAudioUrl, getDisplayableImageUrl, isAudioPlayable } from '@/utils/mediaUtils';
import { clearStoredMedia } from '@/utils/awsS3Utils';

interface PlayerProps {
  isVisible?: boolean;
  podcastId?: string | null;
  episodeId?: string;
  isPlaying?: boolean;
  audioUrl?: string;
}

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
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [audioLoadError, setAudioLoadError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        console.log("Player: Audio metadata loaded", { duration: audioRef.current.duration });
        setTotalDuration(audioRef.current.duration);
      }
    });
    
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });
    
    audioRef.current.addEventListener('error', (e) => {
      console.error('Player: Audio error', e);
      setIsPlaying(false);
      setAudioLoadError(true);
      toast({
        title: "Playback Error",
        description: "Unable to play this audio. The file may be unavailable or in an unsupported format.",
      });
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    setAudioLoadError(false);
    if (propAudioUrl) {
      console.log("Player: Setting audio source from prop", propAudioUrl);
      setAudioSource(propAudioUrl);
      return;
    }
    
    if (episodeId && episodeData[episodeId]) {
      const audioSrc = episodeData[episodeId].audioUrl;
      console.log("Player: Setting audio source from episodeData", audioSrc);
      setAudioSource(audioSrc);
      return;
    }
    
    if (podcastId) {
      const dummySource = `https://example.com/podcast/${podcastId}/audio.mp3`;
      console.log("Player: Setting dummy audio source", dummySource);
      setAudioSource(dummySource);
    }
  }, [podcastId, episodeId, propAudioUrl]);

  useEffect(() => {
    if (audioSource) {
      const playableUrl = getPlayableAudioUrl(audioSource);
      console.log("Player: Processing audio URL", { original: audioSource, processed: playableUrl });
      setProcessedAudioUrl(playableUrl);
      
      isAudioPlayable(playableUrl).then(playable => {
        if (!playable) {
          setAudioLoadError(true);
          toast({
            title: "Playback Warning",
            description: "This audio file might not play correctly. Please check the file format.",
          });
        }
      });
    }
  }, [audioSource, toast]);

  useEffect(() => {
    if (audioRef.current && processedAudioUrl) {
      console.log("Player: Setting audio source", processedAudioUrl);
      audioRef.current.src = processedAudioUrl;
      audioRef.current.load();
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
          toast({
            title: "Playback Error",
            description: "Could not play this audio. The file may not be accessible.",
          });
        });
      }
    }
  }, [processedAudioUrl, toast]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
          toast({
            title: "Playback Error",
            description: "Could not play this audio. Please try again.",
          });
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, toast]);

  useEffect(() => {
    if (podcastId && podcastData[podcastId as keyof typeof podcastData]) {
      setCurrentPodcast(podcastId);
      setShowPlayer(true);
      setIsPlaying(initialPlayState);
      setProgress(0);
      setCurrentTime(0);
      
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

  useEffect(() => {
    if (episodeId && episodeData[episodeId]) {
      setTotalDuration(episodeData[episodeId].duration);
    }
  }, [episodeId]);

  const handleTryClearMedia = () => {
    const confirmed = window.confirm('Would you like to clear all stored media? This might help if you are experiencing playback issues.');
    if (confirmed) {
      if (clearStoredMedia()) {
        toast({
          title: "Media Cleared",
          description: "All stored media has been cleared. This may resolve playback issues.",
        });
        window.location.reload();
      }
    }
  };

  const togglePlay = () => {
    if (audioLoadError) {
      toast({
        title: "Cannot Play",
        description: "This audio file cannot be played. Please check the file or try another podcast.",
        action: (
          <Button variant="outline" size="sm" onClick={handleTryClearMedia}>
            Clear Stored Media
          </Button>
        )
      });
      return;
    }
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

  const displayableCoverImage = getDisplayableImageUrl(podcast.coverImage);

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-500 ${
      showPlayer ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-12 md:col-span-3 flex items-center">
            <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
              <img 
                src={displayableCoverImage}
                alt="Podcast cover" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder.svg';
                }}
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

          <div className="col-span-12 md:col-span-6 flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-1 md:mb-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-600 hover:text-primary-900"
                disabled={audioLoadError}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePlay}
                size="icon"
                className="bg-primary-900 hover:bg-primary-800 text-white rounded-full h-10 w-10"
                disabled={audioLoadError}
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
                disabled={audioLoadError}
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
                disabled={audioLoadError}
              />
              <span className="text-xs text-primary-500 w-8">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 flex items-center justify-end space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="text-primary-600 hover:text-primary-900"
                disabled={audioLoadError}
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
                disabled={audioLoadError}
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
        {audioLoadError && (
          <div className="flex items-center justify-center mt-1 pb-1 text-xs text-destructive">
            <span>Playback error. </span>
            <button 
              onClick={handleTryClearMedia}
              className="ml-2 text-xs underline hover:text-primary"
            >
              Clear stored media
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
