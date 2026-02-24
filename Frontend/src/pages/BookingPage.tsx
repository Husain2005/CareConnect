import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  Calendar,
  Clock,
  User,
  Star,
  Check,
  ArrowLeft,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = "https://careconnect-ai-ra76.onrender.com";

type Doctor = {
  _id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  available: string[];
  availableDays?: string[];
  address?: {
    subCity?: string;
    city?: string;
    country?: string;
  };
};

type DoctorApiResponse = {
  items: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const BookingPage = () => {
  const INITIAL_VISIBLE = 15;
  const LOAD_MORE_STEP = 10;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [visibleDoctorCount, setVisibleDoctorCount] = useState(INITIAL_VISIBLE);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [problem, setProblem] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const stateDoctor = (location.state as { selectedDoctor?: Doctor } | null)?.selectedDoctor;
        if (stateDoctor?._id) {
          setSelectedDoctor(stateDoctor);
          setStep(2);
        }

        const response = await fetch(`${API_URL}/api/doctor?page=1&limit=200`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data: DoctorApiResponse | Doctor[] = await response.json();
        const fetchedDoctors = Array.isArray(data) ? data : data.items || [];
        const doctorMap = new Map(fetchedDoctors.map((doctor) => [doctor._id, doctor]));
        if (stateDoctor?._id && !doctorMap.has(stateDoctor._id)) {
          doctorMap.set(stateDoctor._id, stateDoctor);
        }

        const preferredDoctorId = searchParams.get("doctorId");
        if (preferredDoctorId) {
          const preferredDoctor = doctorMap.get(preferredDoctorId);
          if (preferredDoctor) {
            setSelectedDoctor(preferredDoctor);
            setStep(2);
          } else {
            const doctorResponse = await fetch(`${API_URL}/api/doctor/${preferredDoctorId}`);
            if (doctorResponse.ok) {
              const directDoctor = (await doctorResponse.json()) as Doctor;
              doctorMap.set(directDoctor._id, directDoctor);
              setSelectedDoctor(directDoctor);
              setStep(2);
            }
          }
        }

        setDoctors(Array.from(doctorMap.values()));
      } catch (error) {
        toast.error("Could not load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [searchParams, location.state]);

  useEffect(() => {
    if (!token || !selectedDoctor || !selectedDate) {
      setBookedTimes([]);
      return;
    }

    const fetchBookedTimes = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/appointments/doctor/${selectedDoctor._id}/booked-slots?date=${selectedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) return;
        const data = await response.json();
        setBookedTimes(Array.isArray(data?.bookedTimes) ? data.bookedTimes : []);
      } catch {
        setBookedTimes([]);
      }
    };

    fetchBookedTimes();
  }, [token, selectedDoctor?._id, selectedDate]);

  const occupiedSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return new Set<string>();
    return new Set(bookedTimes);
  }, [bookedTimes, selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedTime && occupiedSlots.has(selectedTime)) {
      setSelectedTime("");
    }
  }, [occupiedSlots, selectedTime]);

  const availableDates = useMemo(() => {
    const today = new Date();
    const source = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      return {
        day,
        date: date.getDate(),
        full: date.toISOString().split("T")[0],
      };
    });

    const allowedDays = selectedDoctor?.availableDays?.length
      ? new Set(selectedDoctor.availableDays)
      : null;

    const filtered = allowedDays
      ? source.filter((item) => allowedDays.has(item.day))
      : source;

    return filtered.slice(0, 10);
  }, [selectedDoctor?.availableDays]);

  useEffect(() => {
    if (!selectedDate) return;
    const stillValid = availableDates.some((item) => item.full === selectedDate);
    if (!stillValid) {
      setSelectedDate("");
      setSelectedTime("");
    }
  }, [availableDates, selectedDate]);

  useEffect(() => {
    setSelectedDate("");
    setSelectedTime("");
    setBookedTimes([]);
  }, [selectedDoctor?._id]);

  const filteredDoctors = useMemo(() => {
    const query = doctorQuery.trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query)
    );
  }, [doctors, doctorQuery]);

  useEffect(() => {
    setVisibleDoctorCount(INITIAL_VISIBLE);
  }, [doctorQuery]);

  const visibleDoctors = useMemo(
    () => filteredDoctors.slice(0, visibleDoctorCount),
    [filteredDoctors, visibleDoctorCount]
  );

  const allSlotsBooked = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return false;
    const slots = selectedDoctor.available || [];
    if (!slots.length) return true;
    return slots.every((slot) => occupiedSlots.has(slot));
  }, [selectedDoctor, selectedDate, occupiedSlots]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !problem.trim()) return;
    if (!token) {
      toast.error("Please login first");
      navigate("/auth?mode=login&role=patient");
      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: selectedDate,
          time: selectedTime,
          notes: "Booked from patient dashboard",
          symptoms: problem,
          problem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      toast.success("Appointment booked successfully", {
        description: `${selectedDoctor.name} on ${selectedDate} at ${selectedTime}`,
      });
      navigate("/dashboard/patient");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <DashboardHeader role="patient" title="Book Appointment" subtitle="Find a doctor and choose a slot" />

      <div className="max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Book an <span className="text-primary">Appointment</span>
            </h1>
            <p className="text-muted-foreground">
              Select a doctor, choose date and time, add your health problem, then confirm.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { num: 1, label: "Select Doctor" },
              { num: 2, label: "Choose Time" },
              { num: 3, label: "Confirm" },
            ].map(({ num, label }, index) => (
              <div key={num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= num
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > num ? <Check className="w-5 h-5" /> : num}
                  </div>
                  <span className={`hidden sm:block text-sm font-medium ${step >= num ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${step > num ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="font-display text-xl font-semibold text-foreground">Choose Your Doctor</h2>
                <button
                  onClick={() => navigate("/dashboard/patient/find-doctors")}
                  className="text-sm text-primary hover:underline"
                >
                  Open doctor directory
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={doctorQuery}
                  onChange={(event) => setDoctorQuery(event.target.value)}
                  placeholder="Search doctor by name or specialty"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                />
              </div>

              {!loadingDoctors && (
                <p className="text-sm text-muted-foreground">
                  Showing {visibleDoctors.length} of {filteredDoctors.length} doctors
                </p>
              )}

              {loadingDoctors && <p className="text-muted-foreground">Loading doctors...</p>}

              <div className="grid gap-4">
                {!loadingDoctors && visibleDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer ${
                      selectedDoctor?._id === doctor._id
                        ? "border-primary bg-secondary"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-14 h-14 bg-secondary rounded-2xl border border-border flex items-center justify-center">
                          <Stethoscope className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty} • {doctor.experience}
                            {doctor.address?.city ? ` • ${doctor.address.city}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-4 h-4" />
                          <span className="font-medium">{doctor.rating || 0}</span>
                        </div>
                        {selectedDoctor?._id === doctor._id && (
                          <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!loadingDoctors && filteredDoctors.length > visibleDoctors.length && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setVisibleDoctorCount((count) => count + LOAD_MORE_STEP)}
                    className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary"
                  >
                    Show more doctors
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-6">
                <GradientButton
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!selectedDoctor}
                  className="min-w-[150px]"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GradientButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Selected doctor</p>
                  <p className="font-semibold text-foreground">{selectedDoctor?.name || "None"}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary"
                >
                  Change doctor
                </button>
              </div>

              <h2 className="font-display text-xl font-semibold text-foreground">Select Date & Time</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Choose a Date
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {availableDates.map((d) => (
                    <button
                      key={d.full}
                      onClick={() => {
                        setSelectedDate(d.full);
                        setSelectedTime("");
                      }}
                      className={`flex-shrink-0 w-20 p-4 rounded-2xl text-center ${
                        selectedDate === d.full
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-xs font-medium opacity-70">{d.day}</p>
                      <p className="text-2xl font-bold mt-1">{d.date}</p>
                    </button>
                  ))}
                </div>
                {availableDates.length === 0 && (
                  <p className="text-sm text-destructive mt-2">This doctor has no available day configured.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Available Slots
                </label>
                {selectedDate && allSlotsBooked && (
                  <p className="mb-3 text-sm text-destructive">All slots are booked for this date. Please choose another date.</p>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {selectedDoctor?.available?.map((time) => {
                    const isOccupied = occupiedSlots.has(time);
                    return (
                      <button
                        key={time}
                        onClick={() => !isOccupied && setSelectedTime(time)}
                        disabled={isOccupied}
                        className={`p-3 rounded-xl text-center font-medium ${
                          isOccupied
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : selectedTime === time
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {time}
                        {isOccupied ? " (Booked)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <GradientButton variant="outline" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </GradientButton>
                <GradientButton
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime || allSlotsBooked}
                  className="min-w-[150px]"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GradientButton>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="font-display text-xl font-semibold text-foreground">Confirm Your Booking</h2>

              <AnimatedCard hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-secondary border border-border rounded-2xl flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg text-foreground">{selectedDoctor?.name}</h3>
                      <p className="text-muted-foreground">{selectedDoctor?.specialty}</p>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-medium text-foreground">{selectedTime}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Describe your problem</label>
                    <textarea
                      value={problem}
                      onChange={(event) => setProblem(event.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                      rows={4}
                      placeholder="Write your health problem or reason for appointment"
                    />
                  </div>
                </div>
              </AnimatedCard>

              <div className="flex justify-between pt-6">
                <GradientButton variant="outline" size="lg" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </GradientButton>
                <GradientButton
                  variant="primary"
                  size="lg"
                  onClick={handleBook}
                  disabled={isBooking || !problem.trim()}
                  className="min-w-[180px]"
                >
                  {isBooking ? "Booking..." : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </GradientButton>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default BookingPage;
