
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className={`relative transition-all duration-300 ${
      isFocused ? 'ring-2 ring-accent-purple/50' : ''
    }`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        type="text"
        placeholder="Search podcasts, episodes, or creators..."
        className="block w-full pl-10 pr-12 py-3 border-gray-300 bg-white rounded-xl text-primary-900 focus:outline-none transition-shadow duration-200"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
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
  );
};

export default SearchBar;
