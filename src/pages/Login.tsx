
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Github, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      toast({
        title: "Success",
        description: "You've successfully logged in. Welcome back!",
      });
      setIsLoading(false);
      // In a real app, you would redirect to dashboard or home after login
    }, 1500);
  };

  const handleWalletLogin = () => {
    toast({
      title: "Wallet connection",
      description: "Web3 wallet connection coming soon!",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Button>
          </Link>
          
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink mx-auto flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <h2 className="text-center text-3xl font-display font-bold text-primary-900">
            Sign in to PodVilla
          </h2>
          <p className="mt-2 text-center text-sm text-primary-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-accent-purple hover:text-accent-purple/90">
              Create one here
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-accent-purple focus:ring-accent-purple"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-primary-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-accent-purple hover:text-accent-purple/90">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary-900 hover:bg-primary-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-primary-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleWalletLogin}
                  className="w-full"
                >
                  <svg width="20" height="20" viewBox="0 0 784.37 1277.39" className="mr-2">
                    <g>
                      <polygon fill="#343434" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54" />
                      <polygon fill="#8C8C8C" points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33" />
                      <polygon fill="#3C3C3B" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89" />
                      <polygon fill="#8C8C8C" points="392.07,1277.38 392.07,956.52 0,724.89" />
                      <polygon fill="#141414" points="392.07,882.29 784.13,650.54 392.07,472.33" />
                      <polygon fill="#393939" points="0,650.54 392.07,882.29 392.07,472.33" />
                    </g>
                  </svg>
                  Metamask
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWalletLogin}
                  className="w-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                    <circle cx="12" cy="12" r="10" fill="#4F46E5" />
                    <path d="M12,6 L18,12 L12,18 L6,12 L12,6" fill="white" />
                  </svg>
                  Dojima
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
