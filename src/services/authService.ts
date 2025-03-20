
import { toast } from "sonner";

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  walletAddress?: string;
  walletType?: 'metamask' | 'dojima' | null;
}

// Mock authentication service
class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Login with email and password
  async loginWithEmail(email: string, password: string): Promise<User | null> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      this.currentUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      };
      
      this.isAuthenticated = true;
      
      localStorage.setItem('podvilla_user', JSON.stringify(this.currentUser));
      localStorage.setItem('podvilla_auth', 'true');
      
      return this.currentUser;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return null;
    }
  }

  // Login with Metamask
  async loginWithMetamask(): Promise<User | null> {
    try {
      toast.info('Connecting to Metamask...');
      
      // Check if Metamask is available
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install Metamask to use this feature');
        return null;
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      
      // Mock successful login
      this.currentUser = {
        id: '2',
        email: `user_${walletAddress.substring(0, 6)}@podvilla.com`,
        name: `Wallet User ${walletAddress.substring(0, 6)}`,
        profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        walletAddress,
        walletType: 'metamask'
      };
      
      this.isAuthenticated = true;
      
      localStorage.setItem('podvilla_user', JSON.stringify(this.currentUser));
      localStorage.setItem('podvilla_auth', 'true');
      
      return this.currentUser;
    } catch (error) {
      console.error('Metamask login error:', error);
      toast.error('Metamask connection failed. Please try again.');
      return null;
    }
  }

  // Login with Dojima Wallet (simulated)
  async loginWithDojimaWallet(): Promise<User | null> {
    try {
      toast.info('Connecting to Dojima Wallet...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const mockWalletAddress = '0xdojima' + Math.random().toString(16).substring(2, 8);
      
      this.currentUser = {
        id: '3',
        email: `dojima_${mockWalletAddress.substring(0, 6)}@podvilla.com`,
        name: `Dojima User ${mockWalletAddress.substring(0, 6)}`,
        profileImage: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
        walletAddress: mockWalletAddress,
        walletType: 'dojima'
      };
      
      this.isAuthenticated = true;
      
      localStorage.setItem('podvilla_user', JSON.stringify(this.currentUser));
      localStorage.setItem('podvilla_auth', 'true');
      
      return this.currentUser;
    } catch (error) {
      console.error('Dojima login error:', error);
      toast.error('Dojima wallet connection failed. Please try again.');
      return null;
    }
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('podvilla_user');
    localStorage.removeItem('podvilla_auth');
    toast.success('Logged out successfully');
  }

  // Initialize auth state from localStorage
  initAuthState(): void {
    const storedUser = localStorage.getItem('podvilla_user');
    const storedAuth = localStorage.getItem('podvilla_auth');
    
    if (storedUser && storedAuth === 'true') {
      this.currentUser = JSON.parse(storedUser);
      this.isAuthenticated = true;
    }
  }

  // Register new user (simulated)
  async register(email: string, password: string): Promise<User | null> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      this.currentUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      };
      
      this.isAuthenticated = true;
      
      localStorage.setItem('podvilla_user', JSON.stringify(this.currentUser));
      localStorage.setItem('podvilla_auth', 'true');
      
      return this.currentUser;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return null;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Initialize authentication state on load
authService.initAuthState();

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

