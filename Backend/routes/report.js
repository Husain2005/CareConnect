import express from "express";
import { analyzeReportImage } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/analyze-image", analyzeReportImage);

export default router;
