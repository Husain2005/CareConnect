import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ReportAnalyzer } from "@/components/report/ReportAnalyzer";
import { FileText, Sparkles, Shield, Clock } from "lucide-react";

const ReportAnalyzerPage = () => {
  return (
    <>
      <DashboardHeader role="patient" title="Report Analyzer" subtitle="Upload and review your medical reports" />

      <div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <FileText className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Medical Report <span className="text-gradient">Analyzer</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload report images and get Gemini-powered analysis with actionable insights.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { icon: Sparkles, text: "Gemini-Powered Analysis" },
              { icon: Shield, text: "HIPAA Compliant" },
              { icon: Clock, text: "Results in Seconds" },
            ].map(({ icon: Icon, text }, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Analyzer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ReportAnalyzer />
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto"
          >
            ⚠️ AI analysis is for informational purposes only. Always consult your doctor for medical interpretations.
          </motion.p>
      </div>
    </>
  );
};

export default ReportAnalyzerPage;
