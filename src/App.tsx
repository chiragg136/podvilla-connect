
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Library from "./pages/Library";
import Rooms from "./pages/Rooms";
import RoomChannel from "./pages/RoomChannel";
import Profile from "./pages/Profile";
import PodcastUpload from "./pages/PodcastUpload";
import PodcastDetails from "./pages/PodcastDetails";

// Create a client
const queryClient = new QueryClient();

// Initialize IPFS storage preference
if (localStorage.getItem('storagePreference') === null) {
  localStorage.setItem('storagePreference', 'ipfs');
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/library" element={<Library />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:roomId" element={<RoomChannel />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<PodcastUpload />} />
              <Route path="/podcast/:id" element={<PodcastDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
