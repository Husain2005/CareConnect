import Patient from "../models/patient.js";
import bcrypt from "bcryptjs";

export const registerPatient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // check existing user
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new patient
    const patient = new Patient({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await patient.save();

    res.status(201).json({
      message: "Patient registered successfully",
      patient
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};