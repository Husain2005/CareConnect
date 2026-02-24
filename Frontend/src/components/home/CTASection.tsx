import { ArrowRight, Stethoscope, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-20 pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Join thousands of patients and doctors already using CareConnect
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup&role=patient">
              <div className="gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
                <UserCircle className="w-5 h-5" />
                I'm a Patient
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
            <Link to="/auth?mode=signup&role=doctor">
              <div className="border border-border bg-secondary/40 text-foreground px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-3 cursor-pointer hover:bg-secondary transition-colors">
                <Stethoscope className="w-5 h-5" />
                I'm a Doctor
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
