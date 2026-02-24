import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-foreground mb-6">About CareConnect</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            CareConnect is a healthcare coordination platform built to remove friction from booking, follow-ups, and patient-doctor communication.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-2">Our Mission</h2>
              <p className="text-sm text-muted-foreground">Make quality healthcare access simple, clear, and fast for everyone.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-2">Our Approach</h2>
              <p className="text-sm text-muted-foreground">Minimal interfaces, reliable workflows, and secure data handling.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
