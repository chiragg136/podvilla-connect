
import { useState, useEffect } from 'react';
import { Play, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16 px-6">
      {/* Background decoration */}
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl opacity-70"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent-pink/10 rounded-full blur-3xl opacity-70"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Hero Content - Takes 3 columns on large screens */}
          <div className={`lg:col-span-3 space-y-8 transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 font-medium text-sm mb-6">
                Discover • Stream • Connect
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-primary-900 text-balance">
                Your world of podcasts, <span className="text-gradient">reimagined</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-primary-600 max-w-xl leading-relaxed">
                Discover, stream, and connect with your favorite creators on a beautiful, secure podcast platform designed for both listeners and creators.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="group bg-primary-900 hover:bg-primary-800 text-white rounded-full px-8 py-6 text-base"
              >
                Get Started 
                <MoveRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full border border-primary-300 px-8 py-6 text-base font-medium text-primary-700 hover:bg-primary-50"
              >
                Explore Podcasts
              </Button>
            </div>
          </div>

          {/* Hero Image - Takes 2 columns on large screens */}
          <div className={`lg:col-span-2 transform transition-all duration-700 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 rounded-3xl blur-xl opacity-80 scale-95 translate-y-4"></div>
              <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden subtle-ring hover-scale">
                <div className="aspect-w-4 aspect-h-5 bg-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1400&q=80" 
                    alt="Podcast Studio" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center mb-2">
                      <Button 
                        size="icon" 
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-primary-900 mr-4 hover:scale-105 transition-transform"
                      >
                        <Play className="h-5 w-5 ml-0.5" />
                      </Button>
                      <div>
                        <h3 className="font-semibold text-lg">The Daily Tech</h3>
                        <p className="text-sm text-gray-200">Latest Episode</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Stats */}
        <div className={`mt-16 max-w-6xl mx-auto transform transition-all duration-700 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="glass-panel rounded-2xl py-6 px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Active Listeners", value: "2M+" },
              { label: "Podcast Creators", value: "50K+" },
              { label: "Episodes Available", value: "1M+" },
              { label: "Hours Streamed", value: "500M+" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary-900">{stat.value}</p>
                <p className="text-sm md:text-base text-primary-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
