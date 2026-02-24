import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
	emergencyConnect,
	getEmergencyTargets,
	 getEmergencyAlerts,
	getEmergencyMessages,
	sendEmergencyMessage,
	startEmergencyCall,
	getIncomingEmergencyCalls,
	acceptEmergencyCall,
	rejectEmergencyCall,
	getEmergencyCallState,
	addEmergencyIceCandidate,
	endEmergencyCall,
} from "../controllers/emergency.controller.js";

const router = express.Router();

router.post("/connect", authMiddleware, emergencyConnect);
router.get("/targets", authMiddleware, getEmergencyTargets);
router.get("/alerts", authMiddleware, getEmergencyAlerts);
router.get("/messages/:targetUserId", authMiddleware, getEmergencyMessages);
router.post("/messages/:targetUserId", authMiddleware, sendEmergencyMessage);
router.post("/call/start", authMiddleware, startEmergencyCall);
router.get("/call/incoming", authMiddleware, getIncomingEmergencyCalls);
router.post("/call/accept", authMiddleware, acceptEmergencyCall);
router.post("/call/reject", authMiddleware, rejectEmergencyCall);
router.get("/call/:callId", authMiddleware, getEmergencyCallState);
router.post("/call/:callId/ice", authMiddleware, addEmergencyIceCandidate);
router.post("/call/:callId/end", authMiddleware, endEmergencyCall);

export default router;
