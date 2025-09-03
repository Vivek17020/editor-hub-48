import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import NewsHomepage from "./pages/NewsHomepage";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import RSSFeed from "./pages/RSSFeed";
import SitemapXML from "./pages/SitemapXML";
import NewsSitemapXML from "./pages/NewsSitemapXML";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import EditorialGuidelines from "./pages/EditorialGuidelines";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminNewArticle from "./pages/AdminNewArticle";
import AdminEditArticle from "./pages/AdminEditArticle";
import AdminEngagement from "./pages/AdminEngagement";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<NewsHomepage />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/rss" element={<RSSFeed />} />
                <Route path="/sitemap.xml" element={<SitemapXML />} />
                <Route path="/news-sitemap.xml" element={<NewsSitemapXML />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/editorial-guidelines" element={<EditorialGuidelines />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="articles/new" element={<AdminNewArticle />} />
                  <Route path="articles/:id/edit" element={<AdminEditArticle />} />
                  <Route path="engagement" element={<AdminEngagement />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
