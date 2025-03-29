
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileNavigation from "./components/MobileNavigation";
import Index from "./pages/Index";
import Frontend from "./pages/Frontend";
import Backend from "./pages/Backend";
import Fullstack from "./pages/Fullstack";
import Forum from "./pages/Forum";
import TopicView from "./pages/TopicView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import Blog from "./pages/Blog";
import VideoTutorials from "./pages/VideoTutorials";
import Career from "./pages/Career";
import Jobs from "./pages/Jobs";
import AboutUs from "./pages/AboutUs";
import ForumRules from "./pages/ForumRules";
import Contacts from "./pages/Contacts";
import Help from "./pages/Help";
import Premium from "./pages/Premium";
import PremiumHelp from "./pages/PremiumHelp";
import DevTools from "./pages/DevTools";
import DebugInjector from "./pages/DebugInjector";
import Tools from "./pages/Tools";
import SecretDevTools from "./pages/dfsfdkfks";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "./hooks/use-mobile";
// Import from the new location
import { Badge } from "@/components/ui/badge";
import "./styles/admin.css";

const App = () => {
  const isMobile = useIsMobile();

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/frontend" element={<Frontend />} />
              <Route path="/backend" element={<Backend />} />
              <Route path="/fullstack" element={<Fullstack />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/topic/:id" element={<TopicView />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/video-tutorials" element={<VideoTutorials />} />
              <Route path="/career" element={<Career />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/forum-rules" element={<ForumRules />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/help" element={<Help />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/premium-help" element={<PremiumHelp />} />
              <Route path="/devtools" element={<DevTools />} />
              <Route path="/debug-injector" element={<DebugInjector />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/dfsfdkfks" element={<SecretDevTools />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {isMobile && <MobileNavigation />}
          <Footer className={isMobile ? "pb-16" : ""} />
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
