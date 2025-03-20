
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  const { user, isAuthenticated, login, loginWithMetamask, loginWithDojima } = useUser();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/profile');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast('Please fill in all fields', {
        description: 'Email and password are required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        toast('Login successful!', {
          description: 'Welcome back to PodVilla.',
          variant: 'default'
        });
        navigate('/profile');
      } else {
        toast('Login failed', {
          description: 'Please check your credentials.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast('Login failed', {
        description: 'Please check your credentials.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerConfirmPassword) {
      toast('Please fill in all fields', {
        description: 'All fields are required for registration',
        variant: 'destructive'
      });
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast('Passwords do not match', {
        description: 'Please ensure both passwords are identical',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the register endpoint that will also send a welcome email
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });
      
      if (response.ok) {
        const success = await login(registerEmail, registerPassword);
        if (success) {
          toast('Registration successful!', {
            description: 'Welcome to PodVilla. Check your email for a welcome message.',
            variant: 'default'
          });
          navigate('/profile');
        }
      } else {
        toast('Registration failed', {
          description: 'Please try again with different credentials.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast('Registration failed', {
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMetamaskLogin = async () => {
    setIsLoading(true);
    
    try {
      const success = await loginWithMetamask();
      
      if (success) {
        toast('Metamask login successful!', {
          description: 'Welcome to your PodVilla account',
          variant: 'default'
        });
        navigate('/profile');
      } else {
        toast('Metamask login failed', {
          description: 'Please try again or use another login method.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Metamask login error:', error);
      toast('Metamask login failed', {
        description: 'Please check your wallet connection.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDojimaLogin = async () => {
    setIsLoading(true);
    
    try {
      const success = await loginWithDojima();
      
      if (success) {
        toast('Dojima wallet login successful!', {
          description: 'Welcome to your PodVilla account',
          variant: 'default'
        });
        navigate('/profile');
      } else {
        toast('Dojima wallet login failed', {
          description: 'Please try again or use another login method.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Dojima login error:', error);
      toast('Dojima wallet login failed', {
        description: 'Please check your wallet connection.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-6">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <div className="px-8 pt-8 pb-6 text-center">
            <h1 className="text-2xl font-display font-bold text-primary-900">
              Welcome to PodVilla
            </h1>
            <p className="mt-2 text-primary-600">
              Sign in to access your podcasts and personalized content
            </p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="mx-auto px-8 pb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary-600 hover:text-primary-900">
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary-900"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-primary-600">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleMetamaskLogin}
                    disabled={isLoading}
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                      alt="Metamask logo" 
                      className="w-5 h-5 mr-2"
                    />
                    Metamask
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDojimaLogin}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2 text-primary-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                    Dojima
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input 
                    id="register-confirm-password" 
                    type="password" 
                    placeholder="••••••••"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary-900"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              
              <p className="mt-4 text-sm text-center text-primary-600">
                By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Login;
