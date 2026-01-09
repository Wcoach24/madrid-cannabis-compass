import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  // Add noindex meta tag for 404 pages
  React.useEffect(() => {
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'noindex, nofollow';
    document.head.appendChild(robotsMeta);
    
    return () => {
      robotsMeta.remove();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Page Not Found | Madrid Cannabis Clubs Guide"
        description="The page you're looking for doesn't exist. Explore our guide to cannabis social clubs in Madrid."
      />
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            <Link
              to="/clubs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Clubs
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold mb-4">Popular Pages</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/guides" className="text-primary hover:underline">
                  Cannabis Culture Guides
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary hover:underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
