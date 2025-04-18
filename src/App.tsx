
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
import { setStoragePreference } from "./api/podcastStorageManager";

// Create a client
const queryClient = new QueryClient();

// Initialize storage preference to Supabase
setStoragePreference('supabase');

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
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
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
