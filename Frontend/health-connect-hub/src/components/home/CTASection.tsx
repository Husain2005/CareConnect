import { motion } from "framer-motion";
import { GradientButton } from "../ui/GradientButton";
import { ArrowRight, Stethoscope, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-12">
            Join thousands of patients and doctors already using CareConnect
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup&role=patient">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-elevated cursor-pointer"
              >
                <UserCircle className="w-5 h-5" />
                I'm a Patient
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
            <Link to="/auth?mode=signup&role=doctor">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 text-primary-foreground border border-white/30 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 cursor-pointer backdrop-blur-sm"
              >
                <Stethoscope className="w-5 h-5" />
                I'm a Doctor
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
