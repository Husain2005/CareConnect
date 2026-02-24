import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";
import EmergencyMessage from "../models/emergencyMessage.js";
import EmergencyCall from "../models/emergencyCall.js";

const AI_SYSTEM_PROMPT = `You are an emergency triage assistant for CareConnect.
Provide concise, safe, non-diagnostic guidance.
If severe symptoms are mentioned, advise immediate emergency services.`;

const getAiFallback = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "Primary doctor is unavailable. Please go to nearest emergency service if symptoms are severe, otherwise follow basic first aid and wait for the next available clinician.";
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { role: "system", parts: [{ text: AI_SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: message || "Emergency help needed" }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    return "Primary doctor is unavailable. Please seek emergency care if symptoms are severe.";
  }

  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Primary doctor is unavailable. Please seek emergency care if symptoms are severe."
  );
};

const uniqueByUserId = (list) => {
  const map = new Map();
  list.forEach((item) => {
    if (item?.userId) map.set(item.userId, item);
  });
  return Array.from(map.values());
};

const getAllowedTargets = async (currentUserId, role) => {
  if (role === "patient") {
    const appointments = await Appointment.find({
      patientId: currentUserId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("doctorId", "name userId isAvailable specialty")
      .sort({ createdAt: -1 });

    const targets = appointments
      .map((apt) => {
        const doctor = apt?.doctorId;
        if (!doctor?.userId) return null;
        return {
          userId: String(doctor.userId),
          name: doctor.name,
          role: "doctor",
          isAvailable: Boolean(doctor.isAvailable),
          specialty: doctor.specialty || "Specialist",
        };
      })
      .filter(Boolean);

    return uniqueByUserId(targets);
  }

  const doctorProfile = await Doctor.findOne({ userId: currentUserId }).select("_id");
  if (!doctorProfile) return [];

  const appointments = await Appointment.find({
    doctorId: doctorProfile._id,
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("patientId", "name")
    .sort({ createdAt: -1 });

  const targets = appointments
    .map((apt) => {
      const patient = apt?.patientId;
      if (!patient?._id) return null;
      return {
        userId: String(patient._id),
        name: patient.name || "Patient",
        role: "patient",
        isAvailable: true,
        specialty: "",
      };
    })
    .filter(Boolean);

  return uniqueByUserId(targets);
};

const resolvePair = async (currentUserId, currentRole, targetUserId) => {
  if (currentRole === "patient") {
    return {
      patientUserId: currentUserId,
      doctorUserId: targetUserId,
    };
  }

  return {
    patientUserId: targetUserId,
    doctorUserId: currentUserId,
  };
};

const canTalkToTarget = async (currentUserId, role, targetUserId) => {
  const targets = await getAllowedTargets(currentUserId, role);
  return targets.find((target) => target.userId === targetUserId) || null;
};

const getCallDisplayName = async (userId) => {
  const user = await User.findById(userId).select("name");
  return user?.name || "User";
};

export const getEmergencyTargets = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const targets = await getAllowedTargets(String(req.user.userId), user.role);
    return res.json({ targets });
  } catch (error) {
    console.error("getEmergencyTargets error:", error);
    return res.status(500).json({ message: "Failed to load emergency targets" });
  }
};

export const getEmergencyMessages = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const targetUserId = String(req.params.targetUserId || "");
    const user = await User.findById(currentUserId).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const targets = await getAllowedTargets(currentUserId, user.role);
    const allowed = targets.some((target) => target.userId === targetUserId);
    if (!allowed) {
      return res.status(403).json({ message: "Target is not in your appointment list" });
    }

    const { patientUserId, doctorUserId } = await resolvePair(currentUserId, user.role, targetUserId);

    if (user.role === "patient") {
      await EmergencyMessage.updateMany(
        {
          patientUserId,
          doctorUserId,
          readByPatient: false,
          $or: [
            { senderType: "ai" },
            { senderType: "user", senderUserId: { $ne: currentUserId } },
          ],
        },
        { $set: { readByPatient: true } }
      );
    } else {
      await EmergencyMessage.updateMany(
        {
          patientUserId,
          doctorUserId,
          readByDoctor: false,
          senderType: "user",
          senderUserId: { $ne: currentUserId },
        },
        { $set: { readByDoctor: true } }
      );
    }

    const messages = await EmergencyMessage.find({ patientUserId, doctorUserId })
      .sort({ createdAt: 1 })
      .select("senderType senderUserId text createdAt");

    return res.json({ messages });
  } catch (error) {
    console.error("getEmergencyMessages error:", error);
    return res.status(500).json({ message: "Failed to load emergency messages" });
  }
};

export const sendEmergencyMessage = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const targetUserId = String(req.params.targetUserId || "");
    const text = String(req.body?.message || "").trim();

    if (!text) return res.status(400).json({ message: "Message is required" });

    const user = await User.findById(currentUserId).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const targets = await getAllowedTargets(currentUserId, user.role);
    const target = targets.find((item) => item.userId === targetUserId);
    if (!target) {
      return res.status(403).json({ message: "Target is not in your appointment list" });
    }

    const { patientUserId, doctorUserId } = await resolvePair(currentUserId, user.role, targetUserId);

    const savedMessage = await EmergencyMessage.create({
      patientUserId,
      doctorUserId,
      senderType: "user",
      senderUserId: currentUserId,
      text,
      readByPatient: user.role === "patient",
      readByDoctor: user.role === "doctor",
    });

    let aiMessage = null;
    if (user.role === "patient" && target.role === "doctor" && !target.isAvailable) {
      const aiReply = await getAiFallback(text);
      aiMessage = await EmergencyMessage.create({
        patientUserId,
        doctorUserId,
        senderType: "ai",
        senderUserId: null,
        text: aiReply,
        readByPatient: false,
        readByDoctor: true,
      });
    }

    return res.json({
      message: "Emergency message sent",
      sent: savedMessage,
      aiReply: aiMessage,
    });
  } catch (error) {
    console.error("sendEmergencyMessage error:", error);
    return res.status(500).json({ message: "Failed to send emergency message" });
  }
};

export const getEmergencyAlerts = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const user = await User.findById(currentUserId).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const targets = await getAllowedTargets(currentUserId, user.role);
    if (targets.length === 0) {
      return res.json({ incomingCount: 0, latestFromName: null, latestAt: null });
    }

    const pairOrFilters = targets.map((target) => {
      if (user.role === "patient") {
        return {
          patientUserId: currentUserId,
          doctorUserId: target.userId,
        };
      }

      return {
        patientUserId: target.userId,
        doctorUserId: currentUserId,
      };
    });

    const unreadFilter =
      user.role === "patient"
        ? {
            $and: [
              { $or: pairOrFilters },
              { readByPatient: false },
              {
                $or: [
                  { senderType: "ai" },
                  { senderType: "user", senderUserId: { $ne: currentUserId } },
                ],
              },
            ],
          }
        : {
            $and: [
              { $or: pairOrFilters },
              { readByDoctor: false },
              { senderType: "user", senderUserId: { $ne: currentUserId } },
            ],
          };

    const incomingCount = await EmergencyMessage.countDocuments(unreadFilter);
    const latestIncoming = await EmergencyMessage.findOne(unreadFilter)
      .sort({ createdAt: -1 })
      .select("senderType senderUserId createdAt");

    let latestFromName = null;
    if (latestIncoming) {
      if (latestIncoming.senderType === "ai") {
        latestFromName = "AI";
      } else if (latestIncoming.senderUserId) {
        const senderUser = await User.findById(latestIncoming.senderUserId).select("name");
        latestFromName = senderUser?.name || "User";
      }
    }

    return res.json({
      incomingCount,
      latestFromName,
      latestAt: latestIncoming?.createdAt || null,
    });
  } catch (error) {
    console.error("getEmergencyAlerts error:", error);
    return res.status(500).json({ message: "Failed to load emergency alerts" });
  }
};

export const emergencyConnect = async (req, res) => {
  try {
    const { mode = "message", message = "", targetUserId } = req.body;
    const userId = String(req.user.userId);

    const user = await User.findById(userId).select("name role");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["message", "call"].includes(mode)) {
      return res.status(400).json({ message: "Invalid mode" });
    }

    const targets = await getAllowedTargets(userId, user.role);
    const preferredTarget = targetUserId
      ? targets.find((target) => target.userId === String(targetUserId))
      : targets[0];

    if (!preferredTarget) {
      const aiReply = await getAiFallback(message);
      return res.json({ connected: false, handledBy: "ai", mode, response: aiReply });
    }

    const { patientUserId, doctorUserId } = await resolvePair(userId, user.role, preferredTarget.userId);

    if (mode === "call") {
      await EmergencyMessage.create({
        patientUserId,
        doctorUserId,
        senderType: "user",
        senderUserId: userId,
        text: `Emergency call requested by ${user.name || "User"}`,
      });
    }

    if (user.role === "patient" && preferredTarget.role === "doctor" && !preferredTarget.isAvailable) {
      const aiReply = await getAiFallback(message);
      await EmergencyMessage.create({
        patientUserId,
        doctorUserId,
        senderType: "ai",
        senderUserId: null,
        text: aiReply,
      });
      return res.json({ connected: false, handledBy: "ai", mode, response: aiReply });
    }

    return res.json({
      connected: true,
      handledBy: preferredTarget.role,
      targetName: preferredTarget.name,
      mode,
      response:
        mode === "call"
          ? `Connecting emergency ${mode} with ${preferredTarget.name}...`
          : `Emergency message delivered to ${preferredTarget.name}.`,
    });
  } catch (error) {
    console.error("Emergency connect error:", error);
    res.status(500).json({ message: "Failed to handle emergency request" });
  }
};

export const startEmergencyCall = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { targetUserId, offer } = req.body;

    if (!targetUserId || !offer) {
      return res.status(400).json({ message: "targetUserId and offer are required" });
    }

    const user = await User.findById(currentUserId).select("role name");
    if (!user) return res.status(404).json({ message: "User not found" });

    const target = await canTalkToTarget(currentUserId, user.role, String(targetUserId));
    if (!target) return res.status(403).json({ message: "Target is not in your appointment list" });

    if (user.role === "patient" && target.role === "doctor" && !target.isAvailable) {
      return res.status(409).json({ message: "Doctor is unavailable for call. Use emergency message for AI support." });
    }

    const { patientUserId, doctorUserId } = await resolvePair(currentUserId, user.role, String(targetUserId));

    const call = await EmergencyCall.create({
      patientUserId,
      doctorUserId,
      callerUserId: currentUserId,
      calleeUserId: String(targetUserId),
      status: "ringing",
      offer,
    });

    await EmergencyMessage.create({
      patientUserId,
      doctorUserId,
      senderType: "user",
      senderUserId: currentUserId,
      text: `Incoming emergency call from ${user.name || "User"}`,
      readByPatient: user.role === "patient",
      readByDoctor: user.role === "doctor",
    });

    return res.json({ callId: call._id, status: call.status });
  } catch (error) {
    console.error("startEmergencyCall error:", error);
    return res.status(500).json({ message: "Failed to start emergency call" });
  }
};

export const getIncomingEmergencyCalls = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const incoming = await EmergencyCall.findOne({
      calleeUserId: currentUserId,
      status: "ringing",
    })
      .sort({ createdAt: -1 })
      .select("callerUserId createdAt");

    if (!incoming) return res.json({ incoming: null });

    const fromName = await getCallDisplayName(incoming.callerUserId);

    return res.json({
      incoming: {
        callId: incoming._id,
        fromUserId: incoming.callerUserId,
        fromName,
        createdAt: incoming.createdAt,
      },
    });
  } catch (error) {
    console.error("getIncomingEmergencyCalls error:", error);
    return res.status(500).json({ message: "Failed to check incoming calls" });
  }
};

export const acceptEmergencyCall = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { callId, answer } = req.body;
    if (!callId || !answer) return res.status(400).json({ message: "callId and answer are required" });

    const call = await EmergencyCall.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });
    if (String(call.calleeUserId) !== currentUserId) return res.status(403).json({ message: "Not authorized" });
    if (call.status !== "ringing") return res.status(400).json({ message: "Call is no longer ringing" });

    call.answer = answer;
    call.status = "connected";
    await call.save();

    return res.json({ status: call.status });
  } catch (error) {
    console.error("acceptEmergencyCall error:", error);
    return res.status(500).json({ message: "Failed to accept call" });
  }
};

export const rejectEmergencyCall = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { callId } = req.body;
    if (!callId) return res.status(400).json({ message: "callId is required" });

    const call = await EmergencyCall.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });
    if (String(call.calleeUserId) !== currentUserId) return res.status(403).json({ message: "Not authorized" });

    call.status = "rejected";
    call.endedAt = new Date();
    await call.save();

    return res.json({ status: call.status });
  } catch (error) {
    console.error("rejectEmergencyCall error:", error);
    return res.status(500).json({ message: "Failed to reject call" });
  }
};

export const getEmergencyCallState = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { callId } = req.params;

    const call = await EmergencyCall.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    const isParticipant =
      String(call.callerUserId) === currentUserId || String(call.calleeUserId) === currentUserId;
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

    return res.json({
      callId: call._id,
      status: call.status,
      callerUserId: call.callerUserId,
      calleeUserId: call.calleeUserId,
      offer: call.offer,
      answer: call.answer,
      callerIceCandidates: call.callerIceCandidates,
      calleeIceCandidates: call.calleeIceCandidates,
    });
  } catch (error) {
    console.error("getEmergencyCallState error:", error);
    return res.status(500).json({ message: "Failed to load call state" });
  }
};

export const addEmergencyIceCandidate = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { callId } = req.params;
    const { candidate } = req.body;
    if (!candidate) return res.status(400).json({ message: "candidate is required" });

    const call = await EmergencyCall.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    if (String(call.callerUserId) === currentUserId) {
      call.callerIceCandidates.push(candidate);
    } else if (String(call.calleeUserId) === currentUserId) {
      call.calleeIceCandidates.push(candidate);
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    await call.save();
    return res.json({ ok: true });
  } catch (error) {
    console.error("addEmergencyIceCandidate error:", error);
    return res.status(500).json({ message: "Failed to add ICE candidate" });
  }
};

export const endEmergencyCall = async (req, res) => {
  try {
    const currentUserId = String(req.user.userId);
    const { callId } = req.params;

    const call = await EmergencyCall.findById(callId);
    if (!call) return res.status(404).json({ message: "Call not found" });

    const isParticipant =
      String(call.callerUserId) === currentUserId || String(call.calleeUserId) === currentUserId;
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

    call.status = "ended";
    call.endedAt = new Date();
    await call.save();

    return res.json({ status: call.status });
  } catch (error) {
    console.error("endEmergencyCall error:", error);
    return res.status(500).json({ message: "Failed to end call" });
  }
};
