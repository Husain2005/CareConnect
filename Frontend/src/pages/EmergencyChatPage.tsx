import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Send, Phone, PhoneOff, BellRing } from "lucide-react";
import { toast } from "sonner";

type Role = "doctor" | "patient";

type Target = {
  userId: string;
  name: string;
  role: Role;
  isAvailable: boolean;
  specialty?: string;
};

type Message = {
  _id?: string;
  senderType: "user" | "ai";
  senderUserId?: string | null;
  text: string;
  createdAt?: string;
};

type IncomingCall = {
  callId: string;
  fromUserId: string;
  fromName: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

const EmergencyChatPage = () => {
  const role = (localStorage.getItem("userRole") || "patient") as Role;
  const myUserId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("token");

  const [targets, setTargets] = useState<Target[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "ringing" | "connected">("idle");
  const [inCallWithName, setInCallWithName] = useState<string>("");

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedRemoteCandidatesRef = useRef<Set<string>>(new Set());
  const pendingLocalCandidatesRef = useRef<string[]>([]);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const selectedTarget = useMemo(
    () => targets.find((target) => target.userId === selectedTargetId),
    [targets, selectedTargetId]
  );

  const fetchTargets = async () => {
    if (!token) return;
    setLoadingTargets(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to load emergency contacts");
      const list = Array.isArray(data?.targets) ? data.targets : [];
      setTargets(list);
      setSelectedTargetId((prev) => prev || list[0]?.userId || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load emergency contacts");
    } finally {
      setLoadingTargets(false);
    }
  };

  const fetchMessages = async (targetUserId: string) => {
    if (!token || !targetUserId) return;
    setLoadingMessages(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency/messages/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to load messages");
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    if (!selectedTargetId) return;
    fetchMessages(selectedTargetId);
    const timer = window.setInterval(() => fetchMessages(selectedTargetId), 3500);
    return () => window.clearInterval(timer);
  }, [selectedTargetId]);

  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    processedRemoteCandidatesRef.current = new Set();
    setActiveCallId(null);
    setCallStatus("idle");
    setInCallWithName("");
  };

  const addLocalTracks = async (pc: RTCPeerConnection) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  };

  const createPeer = (callId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = async (event) => {
      if (!event.candidate || !token) return;
      try {
        await fetch(`${API_URL}/api/emergency/call/${callId}/ice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ candidate: event.candidate.candidate }),
        });
      } catch {
      }
    };

    pc.ontrack = (event) => {
      if (!remoteAudioRef.current) return;
      const [stream] = event.streams;
      remoteAudioRef.current.srcObject = stream;
      remoteAudioRef.current.play().catch(() => {});
    };

    peerRef.current = pc;
    return pc;
  };

  const sendMessage = async () => {
    if (!token || !selectedTargetId || !input.trim() || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency/messages/${selectedTargetId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to send message");
      await fetchMessages(selectedTargetId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const startCall = async () => {
    if (!token || !selectedTargetId || activeCallId) return;

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = pc;
      pendingLocalCandidatesRef.current = [];
      pc.ontrack = (event) => {
        if (!remoteAudioRef.current) return;
        const [stream] = event.streams;
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        pendingLocalCandidatesRef.current.push(event.candidate.candidate);
      };

      await addLocalTracks(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(`${API_URL}/api/emergency/call/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: selectedTargetId, offer: offer.sdp }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to start emergency call");

      setActiveCallId(data.callId);
      setCallStatus("ringing");
      setInCallWithName(selectedTarget?.name || "Contact");
      toast.success("Calling... ringing");

      pc.onicecandidate = async (event) => {
        if (!event.candidate || !token) return;
        try {
          await fetch(`${API_URL}/api/emergency/call/${data.callId}/ice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ candidate: event.candidate.candidate }),
          });
        } catch {
        }
      };

      const pending = [...pendingLocalCandidatesRef.current];
      pendingLocalCandidatesRef.current = [];
      for (const candidate of pending) {
        try {
          await fetch(`${API_URL}/api/emergency/call/${data.callId}/ice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ candidate }),
          });
        } catch {
        }
      }
    } catch (error) {
      cleanupCall();
      toast.error(error instanceof Error ? error.message : "Failed to start call");
    }
  };

  useEffect(() => {
    if (!token || activeCallId) return;

    const pollIncoming = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emergency/call/incoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setIncomingCall(data?.incoming || null);
      } catch {
      }
    };

    pollIncoming();
    const timer = window.setInterval(pollIncoming, 2500);
    return () => window.clearInterval(timer);
  }, [token, activeCallId]);

  const acceptIncomingCall = async () => {
    if (!token || !incomingCall) return;
    try {
      const stateRes = await fetch(`${API_URL}/api/emergency/call/${incomingCall.callId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stateData = await stateRes.json().catch(() => ({}));
      if (!stateRes.ok) throw new Error(stateData?.message || "Failed to load call state");

      const pc = createPeer(incomingCall.callId);
      await addLocalTracks(pc);
      await pc.setRemoteDescription({ type: "offer", sdp: stateData.offer });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const response = await fetch(`${API_URL}/api/emergency/call/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ callId: incomingCall.callId, answer: answer.sdp }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Failed to accept call");

      setActiveCallId(incomingCall.callId);
      setCallStatus("connected");
      setInCallWithName(incomingCall.fromName);
      setIncomingCall(null);
      toast.success("Call connected");
    } catch (error) {
      cleanupCall();
      toast.error(error instanceof Error ? error.message : "Failed to accept call");
    }
  };

  const rejectIncomingCall = async () => {
    if (!token || !incomingCall) return;
    try {
      await fetch(`${API_URL}/api/emergency/call/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ callId: incomingCall.callId }),
      });
    } catch {
    } finally {
      setIncomingCall(null);
    }
  };

  const endCall = async () => {
    if (!token || !activeCallId) {
      cleanupCall();
      return;
    }

    try {
      await fetch(`${API_URL}/api/emergency/call/${activeCallId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
    } finally {
      cleanupCall();
    }
  };

  useEffect(() => {
    if (!token || !activeCallId) return;

    const pollCallState = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emergency/call/${activeCallId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();

        if (!peerRef.current) return;

        if (data.status === "connected" && callStatus !== "connected") {
          setCallStatus("connected");
          toast.success("Call connected");
        }

        if (["ended", "rejected", "missed"].includes(data.status)) {
          cleanupCall();
          return;
        }

        if (data.answer && !peerRef.current.currentRemoteDescription) {
          await peerRef.current.setRemoteDescription({ type: "answer", sdp: data.answer });
        }

        const remoteCandidates = String(data.callerUserId) === myUserId
          ? data.calleeIceCandidates || []
          : data.callerIceCandidates || [];

        for (const candidate of remoteCandidates) {
          if (processedRemoteCandidatesRef.current.has(candidate)) continue;
          try {
            await peerRef.current.addIceCandidate({ candidate });
            processedRemoteCandidatesRef.current.add(candidate);
          } catch {
          }
        }
      } catch {
      }
    };

    pollCallState();
    const timer = window.setInterval(pollCallState, 1200);
    return () => window.clearInterval(timer);
  }, [token, activeCallId, callStatus, myUserId]);

  return (
    <>
      <DashboardHeader
        role={role}
        title="Emergency Chat"
        subtitle="Chat only with users linked through active appointments."
        notificationCount={0}
      />

      {incomingCall && !activeCallId && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">Incoming emergency call from {incomingCall.fromName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={acceptIncomingCall} className="px-3 py-2 rounded-lg bg-green-600 text-white">Pick up</button>
            <button onClick={rejectIncomingCall} className="px-3 py-2 rounded-lg bg-red-600 text-white">Reject</button>
          </div>
        </div>
      )}

      {activeCallId && (
        <div className="mb-4 bg-secondary border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {callStatus === "ringing" ? `Calling ${inCallWithName}...` : `In call with ${inCallWithName}`}
          </p>
          <button onClick={endCall} className="px-3 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2">
            <PhoneOff className="w-4 h-4" />
            End call
          </button>
        </div>
      )}

      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        <div className="bg-card border border-border rounded-2xl p-3 h-[70vh] overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-3">Emergency contacts</p>

          {loadingTargets ? (
            <p className="text-sm text-muted-foreground">Loading contacts...</p>
          ) : targets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active appointment contacts found.</p>
          ) : (
            <div className="space-y-2">
              {targets.map((target) => (
                <button
                  key={target.userId}
                  onClick={() => setSelectedTargetId(target.userId)}
                  className={`w-full text-left p-3 rounded-xl border ${
                    selectedTargetId === target.userId
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-secondary/60"
                  }`}
                >
                  <p className="font-medium text-foreground">{target.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{target.role}{target.specialty ? ` • ${target.specialty}` : ""}</p>
                  {target.role === "doctor" && !target.isAvailable && (
                    <p className="text-xs text-destructive mt-1">Unavailable now (use message for AI backup)</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl h-[70vh] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{selectedTarget?.name || "Select contact"}</p>
              <p className="text-xs text-muted-foreground">Emergency chat channel</p>
            </div>
            <button
              onClick={startCall}
              disabled={!selectedTarget || !!activeCallId}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!selectedTarget ? (
              <p className="text-sm text-muted-foreground">Select a contact to open emergency chat.</p>
            ) : loadingMessages ? (
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emergency messages yet.</p>
            ) : (
              messages.map((message, idx) => {
                const mine = message.senderType === "user" && String(message.senderUserId) === myUserId;
                const ai = message.senderType === "ai";
                return (
                  <div
                    key={message._id || idx}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      ai
                        ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                        : mine
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {ai ? "AI: " : ""}{message.text}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type emergency message..."
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground"
              disabled={!selectedTarget || sending}
            />
            <button
              onClick={sendMessage}
              disabled={!selectedTarget || sending || !input.trim()}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyChatPage;
