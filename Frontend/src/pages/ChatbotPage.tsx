import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { HealthChatbot } from "@/components/chat/HealthChatbot";
import { MessageCircle, Sparkles, Shield } from "lucide-react";

const ChatbotPage = () => {
  return (
    <>
      <DashboardHeader role="patient" title="AI Health Assistant" subtitle="Ask health questions and get guidance" />

      <div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6"
            >
              <MessageCircle className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              AI Health <span className="text-gradient">Assistant</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get instant answers to your health questions. Our AI assistant is here to help 24/7.
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
              { icon: Sparkles, text: "Powered by Gemini AI" },
              { icon: Shield, text: "Private & Secure" },
              { icon: MessageCircle, text: "Instant Responses" },
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

          {/* Chatbot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <HealthChatbot />
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8 max-w-lg mx-auto"
          >
            ⚠️ This AI assistant provides general health information only. Always consult a qualified healthcare professional for medical advice.
          </motion.p>
      </div>
    </>
  );
};

export default ChatbotPage;
