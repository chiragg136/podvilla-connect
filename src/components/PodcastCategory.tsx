
import { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PodcastCard from './PodcastCard';
import { Link } from 'react-router-dom';

interface PodcastCategoryProps {
  title: string;
  subtitle?: string;
  viewAll?: string;
}

const PodcastCategory = ({ title, subtitle, viewAll }: PodcastCategoryProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handlePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Generate random podcasts for this category
  const categoryPodcasts = Array(6).fill(null).map((_, index) => ({
    id: `${title}-${index}`,
    title: ['Tech Today', 'Design Matters', 'Future of AI', 'Global Economics', 'Mindful Moments', 'Creative Writing'][index % 6],
    creator: ['James Wilson', 'Anna Roberts', 'Emily Chen', 'Michael Brown', 'Sarah Johnson', 'Lisa Morgan'][index % 6],
    coverImage: `https://images.unsplash.com/photo-${[
      '1605648916361-9bc12ad6a569', 
      '1599689018356-f4bae9bf4bc3', 
      '1531482615713-2afd69097998', 
      '1589903308904-1010c2294adc', 
      '1519389950473-47ba0277781c', 
      '1495465798138-718f86d1a4bc'
    ][index % 6]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
    duration: `${Math.floor(Math.random() * 40 + 20)} min`,
    isNew: index % 3 === 0,
    isTrending: index % 4 === 0,
  }));

  return (
    <section ref={sectionRef} className="mb-16">
      <div className={`mb-6 flex justify-between items-end transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div>
          <h2 className="text-2xl font-display font-bold text-primary-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-primary-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {viewAll && (
          <Link to={viewAll}>
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {categoryPodcasts.map((podcast, index) => (
          <div 
            key={podcast.id}
            className={`transform transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <PodcastCard
              id={podcast.id}
              title={podcast.title}
              creator={podcast.creator}
              coverImage={podcast.coverImage}
              duration={podcast.duration}
              isNew={podcast.isNew}
              isTrending={podcast.isTrending}
              onPlay={handlePlay}
              isPlaying={playingId === podcast.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default PodcastCategory;
