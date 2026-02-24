import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-foreground mb-6">Services</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            Core tools for patients and doctors to manage appointments, communication, and medical documentation.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["Appointment Booking", "Find specialists and reserve available slots instantly."],
              ["Patient Dashboard", "Track visits, notifications, and care updates in one place."],
              ["Doctor Workspace", "Manage schedule, patients, and appointment statuses."],
              ["AI Assistant", "Get fast guidance and structured report insights."],
            ].map(([title, desc]) => (
              <div key={title} className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
