import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { HealthChatbot } from "@/components/chat/HealthChatbot";

export const FloatingHealthChatbot = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const hideOnRoutes = ["/auth", "/chatbot"];
  if (hideOnRoutes.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {open && (
        <>
          <button
            aria-label="Close assistant"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/35 pointer-events-auto"
          />

          <div className="fixed bottom-24 right-5 w-[380px] h-[560px] max-w-[calc(100vw-24px)] bg-card border border-border rounded-2xl shadow-card overflow-hidden pointer-events-auto md:block hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/60">
              <p className="font-medium text-foreground">Health Assistant</p>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="h-[calc(100%-53px)]">
              <HealthChatbot compact hideHeader />
            </div>
          </div>

          <div className="fixed inset-x-3 bottom-20 top-20 bg-card border border-border rounded-2xl shadow-card overflow-hidden pointer-events-auto md:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/60">
              <p className="font-medium text-foreground">Health Assistant</p>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="h-[calc(100%-53px)]">
              <HealthChatbot compact hideHeader />
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 h-12 md:h-14 px-4 md:px-0 md:w-14 rounded-full gradient-primary text-primary-foreground flex items-center justify-center gap-2 border border-border shadow-soft pointer-events-auto"
        title="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="text-sm font-medium md:hidden">Assistant</span>
      </button>
    </div>
  );
};
