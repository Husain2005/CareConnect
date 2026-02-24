import mongoose from "mongoose";

const emergencyMessageSchema = new mongoose.Schema(
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
    senderType: {
      type: String,
      enum: ["user", "ai"],
      default: "user",
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    readByPatient: {
      type: Boolean,
      default: false,
      index: true,
    },
    readByDoctor: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

emergencyMessageSchema.index({ patientUserId: 1, doctorUserId: 1, createdAt: 1 });

const EmergencyMessage = mongoose.model("EmergencyMessage", emergencyMessageSchema);
export default EmergencyMessage;
