import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-bold">
              C
            </div>
            <span className="font-semibold text-sm text-foreground">
              CareConnect
            </span>
          </Link>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 CareConnect
          </p>
        </div>
      </div>
    </footer>
  );
};
