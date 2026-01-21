import { motion } from "framer-motion";
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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A complete healthcare platform designed for seamless patient-doctor interactions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.1}>
              <div className="flex flex-col items-start">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </motion.div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
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
