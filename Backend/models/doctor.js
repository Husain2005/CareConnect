import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    patientName: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    date: { type: String, trim: true },
  },
  { _id: false }
);

const appointmentRulesSchema = new mongoose.Schema(
  {
    allowWalkIn: { type: Boolean, default: false },
    cancellationWindowHours: { type: Number, default: 12 },
    requiresPrepayment: { type: Boolean, default: false },
    preConsultationNotes: { type: String, default: "" },
    noShowPolicy: { type: String, default: "" },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    default: "",
  },
  religion: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female", "non-binary", "prefer-not-to-say", ""],
    default: "",
  },
  dateOfBirth: {
    type: String,
    trim: true,
    default: "",
  },
  age: {
    type: Number,
    min: 20,
    max: 100,
  },
  contactNumber: {
    type: String,
    trim: true,
    default: "",
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
  },
  specialty: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    default: "",
  },
  experience: {
    type: String,
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0,
  },
  medicalLicenseNumber: {
    type: String,
    trim: true,
    default: "",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  available: [{
    type: String,
  }],
  bio: {
    type: String,
  },
  qualifications: [{
    type: String,
  }],
  clinicName: {
    type: String,
    default: "",
  },
  availableDays: [{
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  }],
  workingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "17:00" },
  },
  slotDurationMinutes: {
    type: Number,
    enum: [10, 15, 20, 30, 45, 60],
    default: 15,
  },
  maxPatientsPerDay: {
    type: Number,
    min: 1,
    default: 24,
  },
  consultationFee: {
    type: Number,
    default: 0,
  },
  consultationFeePhysicalVisit: {
    type: Number,
    default: 0,
  },
  treatmentsOffered: [{ type: String }],
  diseasesHandled: [{ type: String }],
  proceduresPerformed: [{ type: String }],
  languagesSpoken: [{ type: String }],
  specialSkills: [{ type: String }],
  aboutDoctor: { type: String, default: "" },
  treatmentPhilosophy: { type: String, default: "" },
  experienceSummary: { type: String, default: "" },
  achievementsAwards: [{ type: String }],
  patientReviews: [reviewSchema],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalAppointments: {
    type: Number,
    min: 0,
    default: 0,
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  cancellationRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  appointmentRules: {
    type: appointmentRulesSchema,
    default: () => ({}),
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  address: {
    line1: { type: String, default: "" },
    subCity: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "Location coordinates must contain [lng, lat]",
      },
    },
  },
}, { timestamps: true });

doctorSchema.index({ location: "2dsphere" });
doctorSchema.index({ isAvailable: 1, specialty: 1 });
doctorSchema.index({ "address.country": 1, "address.city": 1, "address.subCity": 1 });
doctorSchema.index({ clinicName: 1, medicalLicenseNumber: 1 });
doctorSchema.index({ availableDays: 1, maxPatientsPerDay: 1 });
doctorSchema.index({ isAvailable: 1, rating: -1, averageRating: -1 });
doctorSchema.index({ isAvailable: 1, consultationFeePhysicalVisit: 1, consultationFee: 1 });
doctorSchema.index({ languagesSpoken: 1 });
doctorSchema.index({ yearsOfExperience: -1 });

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
