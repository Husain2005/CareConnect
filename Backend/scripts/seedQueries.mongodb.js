// Run in mongosh after seeding.
// If needed: use('careconnect');

// 1) Basic counts
print('Users:', db.users.countDocuments());
print('Doctors:', db.doctors.countDocuments());
print('Appointments:', db.appointments.countDocuments());

// 2) Count by role
print('Patients:', db.users.countDocuments({ role: 'patient' }));
print('Doctor users:', db.users.countDocuments({ role: 'doctor' }));

// 3) Sample doctors with linked user
const sampleDoctors = db.doctors.aggregate([
  { $limit: 10 },
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: '$user' },
  {
    $project: {
      _id: 1,
      doctorName: '$name',
      specialty: 1,
      doctorEmail: '$user.email',
      doctorRole: '$user.role',
      experience: 1,
      rating: 1,
    },
  },
]).toArray();
printjson(sampleDoctors);

// 4) 20 appointments with patient + doctor names
const sampleAppointments = db.appointments.aggregate([
  { $limit: 20 },
  {
    $lookup: {
      from: 'users',
      localField: 'patientId',
      foreignField: '_id',
      as: 'patient',
    },
  },
  {
    $lookup: {
      from: 'doctors',
      localField: 'doctorId',
      foreignField: '_id',
      as: 'doctor',
    },
  },
  { $unwind: '$patient' },
  { $unwind: '$doctor' },
  {
    $project: {
      _id: 1,
      date: 1,
      time: 1,
      status: 1,
      patientName: '$patient.name',
      patientEmail: '$patient.email',
      doctorName: '$doctor.name',
      specialty: '$doctor.specialty',
      symptoms: 1,
    },
  },
]).toArray();
printjson(sampleAppointments);

// 5) Appointments by status
const statusSummary = db.appointments.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]).toArray();
printjson(statusSummary);
