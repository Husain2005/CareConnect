import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center bg-card border border-border rounded-3xl p-8 md:p-12 shadow-soft">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Trusted by 50,000+ patients
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Modern care,
            <br />
            in one simple platform
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book appointments, analyze reports, and get AI guidance with a clean workflow built for patients and doctors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth?mode=signup&role=patient" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors">
              Explore Features
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border">
            {[
              { value: "500+", label: "Doctors" },
              { value: "50K+", label: "Patients" },
              { value: "4.9", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="bg-secondary/40 rounded-xl border border-border py-4">
                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
