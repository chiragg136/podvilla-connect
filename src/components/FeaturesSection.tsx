
import { useRef, useEffect, useState } from 'react';
import { MicVocal, HeadphonesIcon, UploadCloud, Fingerprint, MessageSquare, Bookmark } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  delay: number
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a small delay for staggered animation
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-accent-purple" />
      </div>
      <h3 className="text-xl font-semibold text-primary-900 mb-2">{title}</h3>
      <p className="text-primary-600">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  const features = [
    {
      icon: HeadphonesIcon,
      title: "Personalized Library",
      description: "Build your collection with your favorite podcasts and discover tailored recommendations."
    },
    {
      icon: MicVocal,
      title: "Studio Quality Audio",
      description: "Experience pristine sound quality with our advanced streaming technology."
    },
    {
      icon: UploadCloud,
      title: "Seamless Uploads",
      description: "Creators can share audio and video content with a streamlined upload process."
    },
    {
      icon: Fingerprint,
      title: "Secure Authentication",
      description: "Multiple login options with enhanced security to protect your account."
    },
    {
      icon: MessageSquare,
      title: "Community Engagement",
      description: "Connect with creators and other listeners through interactive comments."
    },
    {
      icon: Bookmark,
      title: "Offline Listening",
      description: "Download episodes to enjoy your favorite content without an internet connection."
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-900">
            Features designed for <span className="text-accent-purple">podcast lovers</span>
          </h2>
          <p className="mt-4 text-xl text-primary-600 max-w-2xl mx-auto">
            Everything you need to discover, enjoy, and create amazing podcast content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
