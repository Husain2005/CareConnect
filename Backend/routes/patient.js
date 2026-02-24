import express from "express";
import { registerPatient } from "../controllers/patient.js";

const router = express.Router();

router.post("/register", registerPatient);

export default router;