import connectDB from "../models/db.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const symptomsPool = [
  "Routine checkup",
  "Follow-up consultation",
  "Mild headache",
  "Fever monitoring",
  "General consultation",
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dateOffsetIso = (daysFromToday) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
};

const run = async () => {
  try {
    await connectDB();

    const doctors = await Doctor.find({}).lean();
    const patients = await User.find({ role: "patient" }).lean();

    if (!doctors.length || !patients.length) {
      throw new Error("Doctors or patients not found. Seed users/doctors first.");
    }

    const allAppointments = await Appointment.find({}).lean();

    const patientCountMap = new Map();
    const doctorCountMap = new Map();

    for (const apt of allAppointments) {
      const pKey = String(apt.patientId);
      const dKey = String(apt.doctorId);
      patientCountMap.set(pKey, (patientCountMap.get(pKey) || 0) + 1);
      doctorCountMap.set(dKey, (doctorCountMap.get(dKey) || 0) + 1);
    }

    const toInsert = [];
    let doctorIdx = 0;

    // Ensure each patient has at least one pending appointment
    for (const patient of patients) {
      const pKey = String(patient._id);
      if ((patientCountMap.get(pKey) || 0) > 0) continue;

      const doctor = doctors[doctorIdx % doctors.length];
      doctorIdx += 1;

      toInsert.push({
        patientId: patient._id,
        doctorId: doctor._id,
        date: dateOffsetIso(1 + (doctorIdx % 7)),
        time: randomItem(timeSlots),
        status: "pending",
        notes: "Sync repair appointment",
        symptoms: randomItem(symptomsPool),
        problem: randomItem(symptomsPool),
      });

      patientCountMap.set(pKey, 1);
      const dKey = String(doctor._id);
      doctorCountMap.set(dKey, (doctorCountMap.get(dKey) || 0) + 1);
    }

    let patientIdx = 0;

    // Ensure each doctor has at least one pending appointment
    for (const doctor of doctors) {
      const dKey = String(doctor._id);
      if ((doctorCountMap.get(dKey) || 0) > 0) continue;

      const patient = patients[patientIdx % patients.length];
      patientIdx += 1;

      toInsert.push({
        patientId: patient._id,
        doctorId: doctor._id,
        date: dateOffsetIso(1 + (patientIdx % 7)),
        time: randomItem(timeSlots),
        status: "pending",
        notes: "Sync repair appointment",
        symptoms: randomItem(symptomsPool),
        problem: randomItem(symptomsPool),
      });

      doctorCountMap.set(dKey, 1);
      const pKey = String(patient._id);
      patientCountMap.set(pKey, (patientCountMap.get(pKey) || 0) + 1);
    }

    if (toInsert.length > 0) {
      await Appointment.insertMany(toInsert, { ordered: false });
    }

    const remainingDoctorWithoutAppointments = doctors.filter(
      (d) => (doctorCountMap.get(String(d._id)) || 0) === 0
    ).length;

    const remainingPatientWithoutAppointments = patients.filter(
      (p) => (patientCountMap.get(String(p._id)) || 0) === 0
    ).length;

    console.log("✅ Appointment sync complete");
    console.log(`➕ Added appointments: ${toInsert.length}`);
    console.log(`👨‍⚕️ Doctors with 0 appointments: ${remainingDoctorWithoutAppointments}`);
    console.log(`👤 Patients with 0 appointments: ${remainingPatientWithoutAppointments}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

run();
