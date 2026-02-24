import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateAvailability,
  getDoctorAppointments,
} from "../controllers/doctor.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/profile/me", authMiddleware, getMyDoctorProfile);
router.put("/profile", authMiddleware, updateDoctorProfile);
router.put("/availability", authMiddleware, updateAvailability);
router.get("/appointments", authMiddleware, getDoctorAppointments);

// Public routes
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

export default router;
