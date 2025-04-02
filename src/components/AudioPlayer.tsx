
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume1, VolumeX, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { getPlayableAudioUrl, isAudioPlayable } from '@/utils/mediaUtils';

interface AudioPlayerProps {
  audioUrl: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

const AudioPlayer = ({ audioUrl, onEnded, autoPlay = false }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processedUrl, setProcessedUrl] = useState('');
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isPlayable, setIsPlayable] = useState(true);
  const [dataUrlMode, setDataUrlMode] = useState(false);

  useEffect(() => {
    // Reset load attempts when URL changes
    setLoadAttempts(0);
    setIsLoading(true);
    setIsPlayable(true);
    setDataUrlMode(false);
    
    // Process the URL to make it playable
    let playableUrl = getPlayableAudioUrl(audioUrl);
    setProcessedUrl(playableUrl);
    
    // Check if it's a data URL (for localStorage-based files)
    if (playableUrl.startsWith('data:') || playableUrl.startsWith('blob:')) {
      setDataUrlMode(true);
      console.log('AudioPlayer: Using data URL mode');
    }
    
    console.log('AudioPlayer: Using processed URL', playableUrl);
    
    // Check if the audio is playable
    isAudioPlayable(playableUrl).then(playable => {
      setIsPlayable(playable);
      if (!playable) {
        setIsLoading(false);
        toast.error('This audio file cannot be played. It may be in an unsupported format or inaccessible.');
      }
    });
    
    // Create new audio element to avoid stale references
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    const audio = new Audio();
    audioRef.current = audio;
    
    audio.addEventListener('loadedmetadata', () => {
      console.log("AudioPlayer: Audio metadata loaded", { duration: audio.duration });
      setDuration(audio.duration);
      setIsLoading(false);
      if (autoPlay) {
        audio.play().catch(error => {
          console.error('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsLoading(false);
      
      // Try again with a different URL format if we haven't tried too many times
      if (loadAttempts < 3) {
        setLoadAttempts(prev => prev + 1);
        
        // Try to get the data URL from localStorage if it exists
        try {
          const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
          if (urlMappings[playableUrl]) {
            console.log('Trying cached data URL from localStorage');
            playableUrl = urlMappings[playableUrl];
            setProcessedUrl(playableUrl);
            setDataUrlMode(true);
            audio.src = playableUrl;
            audio.load();
            return;
          }
        } catch (e) {
          console.error('Error retrieving cached URL:', e);
        }
        
        let alternativeUrl = playableUrl;
        
        // If it's a Supabase URL, try direct access
        if (playableUrl.includes('supabase.co')) {
          // No alternative needed, just retry
          console.log('Retrying Supabase URL');
        }
        // If it's a Google Drive URL, try alternative formats
        else if (audioUrl.includes('drive.google.com')) {
          const fileIdMatch = audioUrl.match(/[-\w]{25,}/);
          if (fileIdMatch && fileIdMatch[0]) {
            const fileId = fileIdMatch[0];
            
            if (loadAttempts === 0) {
              alternativeUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
            } else if (loadAttempts === 1) {
              alternativeUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            } else {
              alternativeUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            }
          }
        }
        
        console.log(`Retrying with alternative URL (attempt ${loadAttempts}):`, alternativeUrl);
        setProcessedUrl(alternativeUrl);
        audio.src = alternativeUrl;
        audio.load();
        return;
      }
      
      setIsPlayable(false);
      toast.error('Unable to play this audio file. Please check that the file exists and is in a supported format.');
    });
    
    // Set initial volume
    audio.volume = volume / 100;
    audio.src = playableUrl;
    audio.load();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl, autoPlay, onEnded, loadAttempts]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Play prevented:', error);
          setIsPlaying(false);
          toast.error('Unable to play audio. The file may be unavailable.');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!isPlayable) {
      toast.error('This audio file cannot be played.');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const seekTime = value[0];
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const retryWithDataUrl = () => {
    if (!audioUrl) return;
    
    setIsLoading(true);
    
    // Try to get the data URL from localStorage
    try {
      const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
      if (urlMappings[audioUrl]) {
        console.log('Found cached data URL, switching to it');
        const dataUrl = urlMappings[audioUrl];
        setProcessedUrl(dataUrl);
        setDataUrlMode(true);
        
        if (audioRef.current) {
          audioRef.current.src = dataUrl;
          audioRef.current.load();
        }
        
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.error('Error retrieving cached URL:', e);
    }
    
    toast.info('No cached version of this audio found');
    setIsLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex flex-col space-y-3">
        {!isPlayable && !dataUrlMode && (
          <div className="mb-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={retryWithDataUrl}
            >
              <RefreshCcw className="h-3 w-3" /> Try cached version
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-4">
          <Button
            size="icon"
            variant="ghost"
            className="text-primary-600 hover:text-primary-900"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 15);
              }
            }}
            disabled={!isPlayable}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={togglePlay}
            size="icon"
            disabled={isLoading || !isPlayable}
            className="bg-primary-900 hover:bg-primary-800 text-white rounded-full h-10 w-10 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="text-primary-600 hover:text-primary-900"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, currentTime + 15);
              }
            }}
            disabled={!isPlayable}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-primary-500 w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            disabled={isLoading || !isPlayable}
            className="flex-1"
          />
          <span className="text-xs text-primary-500 w-8">
            {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleMute}
            size="icon"
            variant="ghost"
            className="text-primary-600 hover:text-primary-900"
            disabled={!isPlayable}
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
            onValueChange={handleVolumeChange}
            className="w-24"
            disabled={!isPlayable}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
