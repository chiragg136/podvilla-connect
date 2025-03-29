
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { getDisplayableImageUrl } from '@/utils/mediaUtils';

interface PodcastCardProps {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  duration: string;
  onPlay?: () => void;
}

const PodcastCard = ({
  id,
  title,
  creator,
  coverImage,
  duration,
  onPlay,
}: PodcastCardProps) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPlay) {
      onPlay();
    }
  };

  // Process the cover image URL
  const displayableCoverImage = getDisplayableImageUrl(coverImage);

  return (
    <Link to={`/podcast/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative aspect-square">
          <img
            src={displayableCoverImage}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder.svg';
            }}
          />
          {onPlay && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                className="text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 h-12 w-12 rounded-full"
                onClick={handlePlayClick}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{title}</h3>
          <p className="text-sm text-primary-600 truncate">{creator}</p>
          <p className="text-xs text-primary-500 mt-1">{duration}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PodcastCard;
