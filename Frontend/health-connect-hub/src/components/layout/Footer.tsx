import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-background">
              Care<span className="text-primary">Connect</span>
            </span>
          </Link>

          <div className="flex gap-6 text-sm text-background/60">
            <Link to="/privacy" className="hover:text-background transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-background transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-background transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-sm text-background/60">
            © 2024 CareConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
