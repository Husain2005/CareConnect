import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Our Services</h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Discover the range of healthcare services we offer to meet your needs.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
