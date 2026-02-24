import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-sm text-muted-foreground mb-2">Error</p>
        <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-muted-foreground">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="inline-flex items-center px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
