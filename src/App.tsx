import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import Categories from "./pages/Categories.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import Auth from "./pages/Auth.tsx";
import VendorDashboard from "./pages/VendorDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Favorites from "./pages/Favorites.tsx";
import Support from "./pages/Support.tsx";
import Profile from "./pages/Profile.tsx";
import VendorStore from "./pages/VendorStore.tsx";
import NotFound from "./pages/NotFound.tsx";
import FloatingButtons from "@/components/FloatingButtons";

const queryClient = new QueryClient();

// Inner wrapper — re-mounts Routes when language changes so ALL text updates
const AppRoutes = () => {
  const { lang } = useLanguage();
  return (
    <AuthProvider>
      <Routes key={lang}>
        <Route path="/" element={<Index />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/support" element={<Support />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store/:vendorId" element={<VendorStore />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingButtons />
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2147483647, pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto" }}>
          <Sonner
            position="top-center"
            richColors
            expand={false}
            offset="116px"
          />
        </div>
      </div>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;