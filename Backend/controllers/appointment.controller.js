import Appointment from "../models/appointment.js";
import mongoose from "mongoose";
import Doctor from "../models/doctor.js";

const toPositiveInt = (value, defaultValue) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== "string") return null;
  const [h, m] = hhmm.split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

const toSlotLabel = (mins) => {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(m).padStart(2, "0");
  return `${h12}:${mm} ${suffix}`;
};

const buildSlotsFromDoctor = (doctor) => {
  const startMins = toMinutes(doctor?.workingHours?.start || "09:00");
  const endMins = toMinutes(doctor?.workingHours?.end || "17:00");
  const duration = Number(doctor?.slotDurationMinutes || 15);

  if (
    startMins === null ||
    endMins === null ||
    !Number.isFinite(duration) ||
    duration < 5 ||
    endMins <= startMins
  ) {
    return Array.isArray(doctor?.available) ? doctor.available : [];
  }

  const slots = [];
  for (let current = startMins; current + duration <= endMins; current += duration) {
    slots.push(toSlotLabel(current));
  }

  return slots.length ? slots : (Array.isArray(doctor?.available) ? doctor.available : []);
};

const getWeekdayLabel = (dateString) => {
  const date = new Date(`${String(dateString)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return weekdayLabels[date.getDay()];
};

// Book an appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes, symptoms, problem } = req.body;
    const patientId = req.user.userId;

    if (!problem || !String(problem).trim()) {
      return res.status(400).json({ message: "Problem description is required" });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const weekday = getWeekdayLabel(date);
    if (!weekday) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const availableDays = Array.isArray(doctor.availableDays) && doctor.availableDays.length
      ? doctor.availableDays
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (!availableDays.includes(weekday)) {
      return res.status(400).json({ message: "Doctor is not available on selected day" });
    }

    const computedSlots = buildSlotsFromDoctor(doctor);
    const allowedSlots = computedSlots.length ? computedSlots : doctor.available;

    if (!Array.isArray(allowedSlots) || !allowedSlots.includes(time)) {
      return res.status(400).json({ message: "Time slot not available" });
    }

    // Check if appointment already exists for this time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const maxPatientsPerDay = Number(doctor.maxPatientsPerDay || 24);
    const dayCount = await Appointment.countDocuments({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    });

    if (dayCount >= maxPatientsPerDay) {
      return res.status(400).json({ message: "Doctor has reached maximum patients for selected date" });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      notes,
      symptoms: symptoms || String(problem).trim(),
      problem: String(problem).trim(),
      status: "pending",
    });

    res.status(201).json({ 
      message: "Appointment booked successfully", 
      appointment 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to book appointment" });
  }
};

// Get patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;
    const paginated = String(req.query.paginated || "0") === "1";

    if (paginated) {
      const [items, total] = await Promise.all([
        Appointment.find({ patientId: req.user.userId })
          .populate("doctorId", "name specialty experience rating available address location")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments({ patientId: req.user.userId }),
      ]);

      return res.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      });
    }

    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate("doctorId", "name specialty experience rating available address location")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name specialty experience rating")
      .populate("patientId", "name email phone");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if user owns this appointment
    const userId = req.user.userId;
    if (appointment.patientId._id.toString() !== userId && 
        appointment.doctorId.userId?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if user owns this appointment
    const userId = req.user.userId;
    if (appointment.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
};

// Postpone appointment (for patients)
export const postponeAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("doctorId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const userId = req.user.userId;
    if (appointment.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "confirmed"].includes(appointment.status)) {
      return res.status(400).json({ message: "Only active appointments can be postponed" });
    }

    const doctor = appointment.doctorId;
    const weekday = getWeekdayLabel(date);
    if (!weekday) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const availableDays = Array.isArray(doctor.availableDays) && doctor.availableDays.length
      ? doctor.availableDays
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (!availableDays.includes(weekday)) {
      return res.status(400).json({ message: "Doctor is not available on selected day" });
    }

    const computedSlots = buildSlotsFromDoctor(doctor);
    const allowedSlots = computedSlots.length ? computedSlots : doctor.available;
    if (!Array.isArray(allowedSlots) || !allowedSlots.includes(time)) {
      return res.status(400).json({ message: "Selected time is not in doctor's availability" });
    }

    const existingAppointment = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId._id,
      date,
      time,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const maxPatientsPerDay = Number(doctor.maxPatientsPerDay || 24);
    const dayCount = await Appointment.countDocuments({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId._id,
      date,
      status: { $ne: "cancelled" },
    });
    if (dayCount >= maxPatientsPerDay) {
      return res.status(400).json({ message: "Doctor has reached maximum patients for selected date" });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = "pending";
    await appointment.save();

    return res.json({ message: "Appointment postponed successfully", appointment });
  } catch (error) {
    return res.status(500).json({ message: "Failed to postpone appointment" });
  }
};

// Update appointment status (for doctors)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if user is the doctor
    const userId = req.user.userId;
    if (appointment.doctorId.userId?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update appointment" });
  }
};

// Get all appointments (for doctors)
export const getAllAppointments = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 50), 200);
    const skip = (page - 1) * limit;
    const paginated = String(req.query.paginated || "0") === "1";

    if (paginated) {
      const [items, total] = await Promise.all([
        Appointment.find()
          .populate("doctorId", "name specialty")
          .populate("patientId", "name email phone")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Appointment.countDocuments({}),
      ]);

      return res.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      });
    }

    const appointments = await Appointment.find()
      .populate("doctorId", "name specialty")
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

// Get booked slots for one doctor on a specific date
export const getDoctorBookedSlotsByDate = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: "date query is required" });

    const rows = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    }).select("time -_id");

    const bookedTimes = rows.map((row) => row.time);
    return res.json({ doctorId, date, bookedTimes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch booked slots" });
  }
};

// Get appointment load counts for many doctors on a date
export const getDoctorLoadByDate = async (req, res) => {
  try {
    const { date, doctorIds } = req.query;

    if (!date) return res.status(400).json({ message: "date query is required" });
    if (!doctorIds) return res.json({ date, counts: {} });

    const ids = String(doctorIds)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!ids.length) return res.json({ date, counts: {} });

    const validObjectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validObjectIds.length) return res.json({ date, counts: {} });

    const rows = await Appointment.aggregate([
      {
        $match: {
          date: String(date),
          status: { $ne: "cancelled" },
          doctorId: { $in: validObjectIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$doctorId",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {};
    rows.forEach((row) => {
      counts[String(row._id)] = row.count;
    });

    return res.json({ date, counts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch doctor load" });
  }
};
