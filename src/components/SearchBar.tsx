
import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { podcastService, Podcast } from '@/services/podcastService';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Podcast[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedQuery.trim()) {
        setIsSearching(true);
        setShowResults(true);
        
        try {
          const results = await podcastService.searchPodcasts(debouncedQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handlePodcastClick = (podcastId: string) => {
    // In a real app, this would navigate to the podcast details page
    console.log(`Navigate to podcast: ${podcastId}`);
    setShowResults(false);
    // Example navigation
    // navigate(`/podcast/${podcastId}`);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'ring-2 ring-accent-purple/50' : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          placeholder="Search podcasts, episodes, or creators..."
          className="block w-full pl-10 pr-12 py-3 border-gray-300 bg-white rounded-xl text-primary-900 focus:outline-none transition-shadow duration-200"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim() && searchResults.length > 0) {
              setShowResults(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              onClick={handleClear}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-500 hover:text-primary-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-[70vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-primary-600">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
              <p>Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-primary-900">
                  Search Results ({searchResults.length})
                </h3>
              </div>
              <ul>
                {searchResults.map((podcast) => (
                  <li 
                    key={podcast.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <button
                      className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors"
                      onClick={() => handlePodcastClick(podcast.id)}
                    >
                      <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                        <img 
                          src={podcast.coverImage} 
                          alt={podcast.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-900 line-clamp-1">
                          {podcast.title}
                        </h4>
                        <p className="text-sm text-primary-600 line-clamp-1">
                          {podcast.creator}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-primary-600">
              <p>No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
