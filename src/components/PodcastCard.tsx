
import { useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PodcastCardProps {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  duration: string;
  isNew?: boolean;
  isTrending?: boolean;
  onPlay?: (id: string) => void;
  isPlaying?: boolean;
}

const PodcastCard = ({
  id,
  title,
  creator,
  coverImage,
  duration,
  isNew = false,
  isTrending = false,
  onPlay,
  isPlaying = false,
}: PodcastCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(id);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className="group relative rounded-xl overflow-hidden hover-scale subtle-ring image-shine"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square overflow-hidden bg-gray-200">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {(isNew || isTrending) && (
        <div className="absolute top-3 left-3 z-10">
          {isNew && (
            <span className="inline-block px-2 py-1 bg-accent-pink/90 text-white text-xs font-medium rounded-full">
              New
            </span>
          )}
          {isTrending && (
            <span className="inline-block px-2 py-1 bg-accent-purple/90 text-white text-xs font-medium rounded-full ml-1">
              Trending
            </span>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="transform transition-all duration-300 ease-in-out translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex justify-between items-center mb-2">
            <Button
              onClick={handlePlayClick}
              size="icon"
              className="w-10 h-10 rounded-full bg-white text-primary-900 hover:bg-white/90"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              onClick={toggleLike}
              size="icon"
              variant="ghost"
              className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <Heart
                className={`h-4 w-4 ${isLiked ? 'fill-accent-pink text-accent-pink' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-primary-900 truncate">{title}</h3>
        <p className="text-sm text-primary-600 truncate">{creator}</p>
        <div className="mt-1 text-xs text-primary-500">{duration}</div>
      </div>
    </div>
  );
};

export default PodcastCard;
