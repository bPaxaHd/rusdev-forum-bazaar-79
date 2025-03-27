
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Frontend from "./pages/Frontend";
import Backend from "./pages/Backend";
import Fullstack from "./pages/Fullstack";
import Forum from "./pages/Forum";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Navbar />
        <div className="pt-16 min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/frontend" element={<Frontend />} />
            <Route path="/backend" element={<Backend />} />
            <Route path="/fullstack" element={<Fullstack />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
