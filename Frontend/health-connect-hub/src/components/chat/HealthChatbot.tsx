import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const HealthChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI health assistant. How can I help you today? I can answer general health questions, help you understand symptoms, or guide you to the right specialist.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response - Replace with Gemini API integration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getSimulatedResponse(input.trim()),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const getSimulatedResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("headache")) {
      return "Headaches can have various causes including stress, dehydration, lack of sleep, or eye strain. For persistent headaches, I recommend booking an appointment with a general physician or neurologist. Would you like me to help you find a doctor?";
    }
    if (lowerQuery.includes("fever")) {
      return "Fever is often a sign that your body is fighting an infection. Monitor your temperature and stay hydrated. If fever persists above 102°F for more than 2 days, please consult a doctor immediately.";
    }
    if (lowerQuery.includes("appointment") || lowerQuery.includes("book")) {
      return "I'd be happy to help you book an appointment! Please go to our Booking page to select a specialist, date, and time that works for you.";
    }
    
    return "Thank you for your question. While I can provide general health information, I recommend consulting with a healthcare professional for personalized medical advice. Would you like me to help you book an appointment?";
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="gradient-primary p-4 flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
        >
          <Bot className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-primary-foreground">Health Assistant</h3>
          <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-primary-foreground/50 ml-auto" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "gradient-primary text-primary-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-accent text-accent-foreground rounded-tr-sm"
                    : "bg-secondary text-secondary-foreground rounded-tl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, health tips..."
            className="flex-1 h-12 rounded-xl"
            disabled={isLoading}
          />
          <GradientButton
            type="submit"
            variant="primary"
            disabled={!input.trim() || isLoading}
            className="h-12 w-12 p-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </GradientButton>
        </form>
      </div>
    </div>
  );
};
