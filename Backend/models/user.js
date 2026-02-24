import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      trim: true,
    },
    bloodType: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    address: {
      line1: {
        type: String,
        trim: true,
      },
      subCity: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
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
      },
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
