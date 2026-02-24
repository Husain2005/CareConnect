import express from "express";

import {
  handleusersignup,
  handleuserlogin,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authcontroller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", handleusersignup);
router.post("/login", handleuserlogin);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
// OTP-related routes removed



export default router;
