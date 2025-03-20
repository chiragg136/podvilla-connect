
import { Link } from 'react-router-dom';
import { ExternalLink, Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

const AppFooter = () => {
  return (
    <footer className="bg-primary-900 text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="mr-2 w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-primary-900 font-bold text-xs">P</span>
              </div>
              <span className="font-display font-bold text-xl">PodVilla</span>
            </div>
            <p className="text-gray-300 mb-6">
              Reimagining the podcast experience for creators and listeners.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/discover" className="text-gray-300 hover:text-white transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-300 hover:text-white transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/creators" className="text-gray-300 hover:text-white transition-colors">
                  Creators
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/creator-portal" className="text-gray-300 hover:text-white transition-colors">
                  Creator Portal
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-300 hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  Blog <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 mt-8 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PodVilla. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <select className="bg-primary-800 text-gray-300 rounded border border-gray-700 py-1 px-2 text-sm focus:outline-none focus:border-gray-500">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
