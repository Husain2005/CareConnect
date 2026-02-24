import express from "express";
import {
  bookAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  postponeAppointment,
  updateAppointmentStatus,
  getAllAppointments,
  getDoctorBookedSlotsByDate,
  getDoctorLoadByDate,
} from "../controllers/appointment.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.post("/", authMiddleware, bookAppointment);
router.get("/my", authMiddleware, getPatientAppointments);
router.get("/all", authMiddleware, getAllAppointments);
router.get("/doctor-load", authMiddleware, getDoctorLoadByDate);
router.get("/doctor/:doctorId/booked-slots", authMiddleware, getDoctorBookedSlotsByDate);
router.get("/:id", authMiddleware, getAppointmentById);
router.put("/:id/cancel", authMiddleware, cancelAppointment);
router.put("/:id/postpone", authMiddleware, postponeAppointment);
router.put("/:id/status", authMiddleware, updateAppointmentStatus);

export default router;
