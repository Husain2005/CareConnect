import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact</h1>
          <p className="text-lg text-muted-foreground mb-8">Questions or support requests? Reach out and we’ll help quickly.</p>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">support@careconnect.com</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours</p>
              <p className="font-medium text-foreground">Mon - Fri, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
