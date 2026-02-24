import express from "express";
import { sendChatMessage } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/message", sendChatMessage);

export default router;
