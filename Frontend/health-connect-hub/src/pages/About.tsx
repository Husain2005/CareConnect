import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Welcome to CareConnect. We are dedicated to providing the best healthcare services.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
