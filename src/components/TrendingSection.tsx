
import { useRef, useEffect, useState } from 'react';
import PodcastCard from './PodcastCard';

const TrendingSection = () => {
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

  // Sample podcast data
  const trendingPodcasts = [
    {
      id: '1',
      title: 'Design Matters with Anna',
      creator: 'Anna Roberts',
      coverImage: 'https://images.unsplash.com/photo-1599689018356-f4bae9bf4bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '45 min',
      isNew: true,
      isTrending: true,
    },
    {
      id: '2',
      title: 'Tech Today',
      creator: 'James Wilson',
      coverImage: 'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '32 min',
      isTrending: true,
    },
    {
      id: '3',
      title: 'The Future of AI',
      creator: 'Emily Chen',
      coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '55 min',
      isNew: true,
    },
    {
      id: '4',
      title: 'Mindful Moments',
      creator: 'Sarah Johnson',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '28 min',
      isTrending: true,
    },
    {
      id: '5',
      title: 'Global Economics',
      creator: 'Michael Brown',
      coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '42 min',
    },
    {
      id: '6',
      title: 'Creative Writing',
      creator: 'Lisa Morgan',
      coverImage: 'https://images.unsplash.com/photo-1495465798138-718f86d1a4bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      duration: '37 min',
      isNew: true,
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-12 transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-3xl font-display font-bold text-primary-900">
            Trending now
          </h2>
          <p className="mt-3 text-lg text-primary-600">
            Discover what's popular in the PodVilla community
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {trendingPodcasts.map((podcast, index) => (
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
      </div>
    </section>
  );
};

export default TrendingSection;
