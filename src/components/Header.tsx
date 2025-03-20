
import { useState, useEffect } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-8 ${
        scrolled ? 'py-3 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50' : 'py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="relative z-10">
          <div className="flex items-center">
            <div className="mr-2 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-display font-bold text-xl text-primary-900">PodVilla</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/">
            <Button variant="ghost" className="text-primary-600 hover:text-primary-900">Home</Button>
          </Link>
          <Link to="/discover">
            <Button variant="ghost" className="text-primary-600 hover:text-primary-900">Discover</Button>
          </Link>
          <Link to="/library">
            <Button variant="ghost" className="text-primary-600 hover:text-primary-900">Library</Button>
          </Link>
          <div className="relative ml-2 mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search podcasts..."
              className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 border-0 focus:ring-2 focus:ring-primary-500 text-sm transition-all"
            />
          </div>
          <Button variant="ghost" size="icon" className="icon-button">
            <User className="h-5 w-5 text-primary-700" />
          </Button>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity text-white rounded-full px-6">
              Sign In
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden icon-button"
          onClick={toggleMenu}
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-primary-700" />
          ) : (
            <Menu className="h-6 w-6 text-primary-700" />
          )}
        </Button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-0 left-0 right-0 bg-white shadow-lg p-6 pt-20 z-0 animate-slide-down md:hidden">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-primary-900 font-medium px-4 py-2 hover:bg-gray-100 rounded-md" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/discover" className="text-primary-900 font-medium px-4 py-2 hover:bg-gray-100 rounded-md" onClick={() => setMenuOpen(false)}>
                Discover
              </Link>
              <Link to="/library" className="text-primary-900 font-medium px-4 py-2 hover:bg-gray-100 rounded-md" onClick={() => setMenuOpen(false)}>
                Library
              </Link>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search podcasts..."
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-gray-100 border-0 focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-accent-purple to-accent-pink hover:opacity-90 transition-opacity text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
