import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  notes: {
    type: String,
  },
  symptoms: {
    type: String,
  },
  problem: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1, time: 1, status: 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
