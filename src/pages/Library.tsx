
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Player from '@/components/Player';
import AppFooter from '@/components/AppFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Clock, Download, Heart, History, List, ListMusic, PlayCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
      <Icon className="h-8 w-8 text-primary-600" />
    </div>
    <h3 className="text-xl font-medium text-primary-900 mb-2">{title}</h3>
    <p className="text-primary-600 max-w-md">{description}</p>
  </div>
);

const Library = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("favorites");

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your podcast is being prepared for offline listening.",
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-900 mb-2">
              Your Library
            </h1>
            <p className="text-primary-600">Manage your podcasts and listening history</p>
          </div>
          
          <Tabs defaultValue="favorites" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="favorites" className="font-medium">
                <Heart className="h-4 w-4 mr-2" /> Favorites
              </TabsTrigger>
              <TabsTrigger value="history" className="font-medium">
                <History className="h-4 w-4 mr-2" /> History
              </TabsTrigger>
              <TabsTrigger value="playlists" className="font-medium">
                <ListMusic className="h-4 w-4 mr-2" /> Playlists
              </TabsTrigger>
              <TabsTrigger value="downloads" className="font-medium">
                <Download className="h-4 w-4 mr-2" /> Downloads
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites">
              <EmptyState 
                title="No favorites yet" 
                description="Like episodes and podcasts to access them quickly here."
                icon={Heart}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-primary-900">Recently Played</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 hover:bg-gray-50 flex items-center">
                      <div className="w-12 h-12 rounded overflow-hidden mr-4 flex-shrink-0">
                        <img 
                          src={`https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80`}
                          alt="Podcast cover" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary-900 truncate">Design Matters with Anna</h4>
                        <p className="text-sm text-primary-600 truncate">Episode {item}: The Future of Design</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-primary-500 whitespace-nowrap flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> 
                          {item * 10} min left
                        </span>
                        <Button variant="ghost" size="icon" className="text-primary-600" onClick={handleDownload}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary-600">
                          <PlayCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="playlists">
              <EmptyState 
                title="No playlists yet" 
                description="Create playlists to organize your favorite episodes."
                icon={List}
              />
            </TabsContent>
            
            <TabsContent value="downloads">
              <EmptyState 
                title="No downloads yet" 
                description="Download episodes to listen offline anytime, anywhere."
                icon={Download}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
      <Player />
    </div>
  );
};

export default Library;
