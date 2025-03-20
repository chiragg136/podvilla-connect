
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-pink mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
          404
        </div>
        <h1 className="text-4xl font-display font-bold text-primary-900 mb-4">Page not found</h1>
        <p className="text-lg text-primary-600 mb-8">
          We couldn't find the page you're looking for. It might have been removed or doesn't exist.
        </p>
        <Link to="/">
          <Button className="rounded-full px-6 py-6 bg-primary-900 text-white hover:bg-primary-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
