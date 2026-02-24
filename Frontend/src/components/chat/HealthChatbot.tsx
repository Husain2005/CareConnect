import { useState } from "react";
import { GradientButton } from "@/components/ui/GradientButton";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured?: any;
}

type HealthChatbotProps = {
  compact?: boolean;
  hideHeader?: boolean;
};

const API_URL = import.meta.env.VITE_API_URL || "";

const SUGGESTED_PROMPTS = [
  "I have a headache since morning. What should I do?",
  "What symptoms suggest I should visit urgent care?",
  "How do I prepare for a blood test?",
];

export const HealthChatbot = ({ compact = false, hideHeader = false }: HealthChatbotProps) => {
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

    try {
      const response = await fetch(`${API_URL}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Gemini assistant service unavailable");
      }

      const raw = data?.reply || "I couldn't generate a response right now.";
      const structured = data?.structured || null;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: raw,
        structured,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assistant is temporarily unavailable");
      const failResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Gemini assistant is unavailable right now. Please check backend GEMINI_API_KEY and try again.",
      };
      setMessages((prev) => [...prev, failResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col bg-card border border-border/50 overflow-hidden", compact ? "h-full" : "h-[600px] rounded-2xl shadow-card")}>
      {/* Header */}
      {!hideHeader && (
        <div className="gradient-primary p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-primary-foreground">Health Assistant</h3>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              AI guidance • Not for diagnosis
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-primary-foreground/50 ml-auto" />
        </div>
      )}

      {messages.length <= 1 && (
        <div className="px-4 pt-4 pb-1 flex flex-wrap gap-2 border-b border-border/40 bg-secondary/20">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
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
                {message.structured ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">Triage:</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted/30">{message.structured.severity}</span>
                    </div>
                    <p className="text-sm font-medium">{message.structured.summary}</p>
                    {Array.isArray(message.structured.recommendations) && (
                      <ol className="list-decimal list-inside text-sm ml-3">
                        {message.structured.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm">{rec}</li>
                        ))}
                      </ol>
                    )}
                    {message.structured.followUp && (
                      <p className="text-sm text-muted-foreground">Next: {message.structured.followUp}</p>
                    )}
                    {message.structured.caution && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                        <strong>Important:</strong> {message.structured.caution}
                      </div>
                    )}
                    {/* <details className="text-xs text-muted-foreground mt-2">
                      <summary>Full AI text</summary>
                      <pre className="whitespace-pre-wrap text-xs">{message.content}</pre>
                    </details> */}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </div>
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
            placeholder="Describe symptoms or ask a health question..."
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
