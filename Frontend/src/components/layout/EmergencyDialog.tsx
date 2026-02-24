import { useState } from "react";
import { AlertTriangle, Phone, Send, X } from "lucide-react";
import { toast } from "sonner";

type EmergencyDialogProps = {
  role: "doctor" | "patient";
};

type ChatItem = {
  id: string;
  sender: "me" | "system";
  text: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

export const EmergencyDialog = ({ role }: EmergencyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"message" | "call">("message");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<ChatItem[]>([
    {
      id: "welcome",
      sender: "system",
      text: "Emergency desk is ready. If doctor is unavailable, AI triage will assist immediately.",
    },
  ]);

  const sendEmergency = async (forcedMode?: "message" | "call") => {
    const activeMode = forcedMode || mode;
    if (activeMode === "message" && !message.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const outgoing = message.trim();

    if (activeMode === "message") {
      setHistory((prev) => [...prev, { id: `me-${Date.now()}`, sender: "me", text: outgoing }]);
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode: activeMode, message: outgoing }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Emergency service failed");

      setHistory((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: data?.response || "Emergency request processed.",
        },
      ]);

      if (activeMode === "call") {
        toast.success("Emergency call flow started");
      }

      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Emergency service unavailable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Emergency</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close emergency dialog" />
          <div className="absolute inset-x-3 top-16 bottom-6 md:inset-auto md:right-6 md:top-20 md:w-[420px] md:h-[560px] bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <div>
                <p className="font-semibold text-foreground">Emergency Connect</p>
                <p className="text-xs text-muted-foreground capitalize">{role} mode</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-3 border-b border-border flex gap-2">
              <button
                onClick={() => setMode("message")}
                className={`px-3 py-1.5 rounded-lg text-sm ${mode === "message" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
              >
                Message
              </button>
              <button
                onClick={() => setMode("call")}
                className={`px-3 py-1.5 rounded-lg text-sm ${mode === "call" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
              >
                Call
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {history.map((item) => (
                <div key={item.id} className={`rounded-xl px-3 py-2 text-sm ${item.sender === "me" ? "bg-primary text-primary-foreground ml-8" : "bg-secondary text-foreground mr-8"}`}>
                  {item.text}
                </div>
              ))}
            </div>

            {mode === "message" ? (
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe emergency situation..."
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground"
                  disabled={busy}
                />
                <button
                  onClick={() => sendEmergency("message")}
                  disabled={busy || !message.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => sendEmergency("call")}
                  disabled={busy}
                  className="w-full px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Start emergency call
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
