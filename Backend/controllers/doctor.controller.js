import Doctor from "../models/doctor.js";

const toPositiveInt = (value, defaultValue) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

const toFloat = (value) => {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const buildSlots = (start, end, duration) => {
  const startMins = toMinutes(start);
  const endMins = toMinutes(end);
  const step = Number(duration || 15);
  if (startMins === null || endMins === null || !Number.isFinite(step) || step < 5 || endMins <= startMins) {
    return null;
  }

  const slots = [];
  for (let current = startMins; current + step <= endMins; current += step) {
    slots.push(toSlotLabel(current));
  }

  return slots;
};

// Get all doctors (paginated + optional geo-near search)
export const getAllDoctors = async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = Math.min(toPositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const queryText = String(req.query.query || "").trim();
    const specialty = String(req.query.specialty || "").trim();
    const country = String(req.query.country || "").trim();
    const city = String(req.query.city || "").trim();
    const subCity = String(req.query.subCity || "").trim();
    const language = String(req.query.language || "").trim();
    const minRating = Math.max(Math.min(toFloat(req.query.minRating) ?? 0, 5), 0);
    const maxFee = Math.max(toFloat(req.query.maxFee) ?? Number.MAX_SAFE_INTEGER, 0);
    const sortBy = String(req.query.sortBy || "relevance").trim();
    const strictRadius = String(req.query.strictRadius || "0") === "1";

    const userLat = toFloat(req.query.userLat);
    const userLng = toFloat(req.query.userLng);
    const radiusKm = Math.min(Math.max(toFloat(req.query.radiusKm) ?? 30, 1), 5000);

    const baseFilters = { isAvailable: true };
    if (specialty && specialty !== "All") baseFilters.specialty = specialty;
    if (country) baseFilters["address.country"] = new RegExp(`^${escapeRegex(country)}$`, "i");
    if (city) baseFilters["address.city"] = new RegExp(`^${escapeRegex(city)}$`, "i");
    if (subCity) baseFilters["address.subCity"] = new RegExp(`^${escapeRegex(subCity)}$`, "i");
    if (language) baseFilters.languagesSpoken = { $regex: new RegExp(`^${escapeRegex(language)}$`, "i") };

    baseFilters.$and = baseFilters.$and || [];
    baseFilters.$and.push({ $or: [{ rating: { $gte: minRating } }, { averageRating: { $gte: minRating } }] });
    if (Number.isFinite(maxFee) && maxFee < Number.MAX_SAFE_INTEGER) {
      baseFilters.$and.push({
        $or: [
          { consultationFeePhysicalVisit: { $lte: maxFee } },
          { consultationFee: { $lte: maxFee } },
        ],
      });
    }

    if (!baseFilters.$and.length) delete baseFilters.$and;

    if (queryText) {
      baseFilters.$or = [
        { name: { $regex: queryText, $options: "i" } },
        { fullName: { $regex: queryText, $options: "i" } },
        { specialty: { $regex: queryText, $options: "i" } },
        { specialization: { $regex: queryText, $options: "i" } },
        { "address.subCity": { $regex: queryText, $options: "i" } },
        { "address.city": { $regex: queryText, $options: "i" } },
        { "address.country": { $regex: queryText, $options: "i" } },
      ];
    }

    const hasGeo = userLat !== null && userLng !== null;

    if (hasGeo) {
      try {
        const aggregate = await Doctor.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [userLng, userLat] },
              distanceField: "distanceMeters",
              spherical: true,
              ...(strictRadius ? { maxDistance: radiusKm * 1000 } : {}),
              query: baseFilters,
            },
          },
          {
            $addFields: {
              distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] },
            },
          },
          {
            $sort:
              sortBy === "rating"
                ? { averageRating: -1, rating: -1, distanceMeters: 1 }
                : sortBy === "fee"
                ? { consultationFeePhysicalVisit: 1, consultationFee: 1, distanceMeters: 1 }
                : { distanceMeters: 1, averageRating: -1, rating: -1 },
          },
          {
            $facet: {
              items: [
                { $skip: skip },
                { $limit: limit },
                {
                  $project: {
                    userId: 0,
                  },
                },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
        ]);

        const payload = aggregate[0] || { items: [], totalCount: [] };
        const total = payload.totalCount?.[0]?.count || 0;

        return res.json({
          items: payload.items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1),
          },
          filters: { query: queryText, specialty, country, city, subCity, language, minRating, maxFee, sortBy },
          geo: { enabled: true, radiusKm, userLat, userLng, strictRadius },
        });
      } catch (geoError) {
        console.error("Geo query failed, falling back to non-geo search:", geoError?.message || geoError);
      }
    }

    const sortConfig =
      sortBy === "rating"
        ? { averageRating: -1, rating: -1, createdAt: -1 }
        : sortBy === "fee"
        ? { consultationFeePhysicalVisit: 1, consultationFee: 1, createdAt: -1 }
        : sortBy === "experience"
        ? { yearsOfExperience: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Doctor.find(baseFilters)
        .select("-userId")
        .sort(sortConfig)
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(baseFilters),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      filters: { query: queryText, specialty, country, city, subCity, language, minRating, maxFee, sortBy },
      geo: { enabled: false },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doctor" });
  }
};

// Get doctor's own profile
export const getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialty,
      experience,
      bio,
      qualifications,
      consultationFee,
      available,
      address,
      location,
      fullName,
      gender,
      dateOfBirth,
      age,
      contactNumber,
      email,
      specialization,
      yearsOfExperience,
      medicalLicenseNumber,
      clinicName,
      availableDays,
      workingHours,
      slotDurationMinutes,
      maxPatientsPerDay,
      consultationFeePhysicalVisit,
      treatmentsOffered,
      diseasesHandled,
      proceduresPerformed,
      languagesSpoken,
      specialSkills,
      aboutDoctor,
      treatmentPhilosophy,
      experienceSummary,
      achievementsAwards,
      appointmentRules,
    } = req.body;

    const updatePayload = {
      specialty,
      experience,
      bio,
      qualifications,
      consultationFee,
      available,
      fullName,
      gender,
      dateOfBirth,
      age,
      contactNumber,
      email,
      specialization,
      yearsOfExperience,
      medicalLicenseNumber,
      clinicName,
      availableDays,
      slotDurationMinutes,
      maxPatientsPerDay,
      consultationFeePhysicalVisit,
      treatmentsOffered,
      diseasesHandled,
      proceduresPerformed,
      languagesSpoken,
      specialSkills,
      aboutDoctor,
      treatmentPhilosophy,
      experienceSummary,
      achievementsAwards,
      appointmentRules,
    };

    if (workingHours && typeof workingHours === "object") {
      updatePayload.workingHours = {
        start: String(workingHours.start || "09:00"),
        end: String(workingHours.end || "17:00"),
      };

      const generatedSlots = buildSlots(
        updatePayload.workingHours.start,
        updatePayload.workingHours.end,
        slotDurationMinutes || 15
      );

      if (generatedSlots?.length) {
        updatePayload.available = generatedSlots;
      }
    }

    if (address && typeof address === "object") {
      updatePayload.address = {
        line1: address.line1 || "",
        subCity: address.subCity || "",
        city: address.city || "",
        country: address.country || "",
        postalCode: address.postalCode || "",
      };
    }

    if (
      location &&
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      updatePayload.location = {
        type: "Point",
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      };
    }
    
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      updatePayload,
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    res.json({ message: "Profile updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Update availability
export const updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { available },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    res.json({ message: "Availability updated", doctor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update availability" });
  }
};

// Get doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const Appointment = (await import("../models/appointment.js")).default;
    
    // First get the doctor profile to get the doctor _id
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }
    
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};
