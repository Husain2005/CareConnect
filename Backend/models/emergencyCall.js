import mongoose from "mongoose";

const emergencyCallSchema = new mongoose.Schema(
  {
    patientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    callerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    calleeUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ringing", "connected", "rejected", "ended", "missed"],
      default: "ringing",
      index: true,
    },
    offer: {
      type: String,
      default: null,
    },
    answer: {
      type: String,
      default: null,
    },
    callerIceCandidates: {
      type: [String],
      default: [],
    },
    calleeIceCandidates: {
      type: [String],
      default: [],
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

emergencyCallSchema.index({ patientUserId: 1, doctorUserId: 1, createdAt: -1 });

const EmergencyCall = mongoose.model("EmergencyCall", emergencyCallSchema);
export default EmergencyCall;
