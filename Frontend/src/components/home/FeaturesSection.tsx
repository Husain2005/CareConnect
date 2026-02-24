import { AnimatedCard } from "../ui/AnimatedCard";
import { Calendar, MessageCircle, FileText, Video, Bell, Shield } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Schedule appointments with your preferred doctors in just a few clicks.",
  },
  {
    icon: MessageCircle,
    title: "AI Health Chat",
    description: "Get instant health insights from our AI-powered assistant anytime.",
  },
  {
    icon: FileText,
    title: "Report Analyzer",
    description: "Upload medical reports and get AI-powered analysis instantly.",
  },
  {
    icon: Video,
    title: "Video Consults",
    description: "Connect with doctors via secure video calls from anywhere.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss an appointment with intelligent notifications.",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Your health data is encrypted and completely secure.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 bg-card border border-border rounded-3xl p-8 md:p-10 shadow-soft">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground mb-2">Features</p>
          <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete healthcare platform designed for seamless patient-doctor interactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <AnimatedCard key={feature.title} hover={false} className="bg-secondary/30 border-border shadow-soft">
              <div className="flex flex-col items-start">
                <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
};
