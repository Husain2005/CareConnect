import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";

/* ---------------- SIGNUP ---------------- */
export const handleusersignup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // prevent duplicate accounts
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: role || "patient",
      isVerified: true,
    });

    if (role === "doctor") {
      await Doctor.create({
        userId: user._id,
        name: user.name,
        specialty: "General Physician",
        experience: "0 years",
        available: [],
        address: {
          line1: "",
          subCity: "",
          city: "",
          country: "",
          postalCode: "",
        },
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
      });
    }

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

/* ---------------- LOGIN ---------------- */
export const handleuserlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* ---------------- VERIFY OTP ---------------- */
// OTP verification flow removed; signup now creates account immediately.

/* ---------------- RESEND SIGNUP OTP ---------------- */
// Resend OTP removed

/* ---------------- SEND RESET OTP ---------------- */
// Send reset OTP removed

/* ---------------- RESET PASSWORD ---------------- */
// Reset password via OTP removed. Keep password reset flow out of scope for now.

/* ---------------- PROFILE ---------------- */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email phone role dateOfBirth bloodType allergies emergencyContact"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, bloodType, allergies, emergencyContact } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof name === "string") user.name = name.trim();
    if (typeof phone === "string") user.phone = phone.trim();
    if (typeof dateOfBirth === "string") user.dateOfBirth = dateOfBirth.trim();
    if (typeof bloodType === "string") user.bloodType = bloodType.trim();
    if (typeof allergies === "string") user.allergies = allergies.trim();
    if (typeof emergencyContact === "string") user.emergencyContact = emergencyContact.trim();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        bloodType: user.bloodType,
        allergies: user.allergies,
        emergencyContact: user.emergencyContact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};
