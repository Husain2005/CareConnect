import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Calendar, Clock, User, Star, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  available: string[];
}

const doctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Williams", specialty: "Cardiologist", rating: 4.9, experience: "15 years", available: ["09:00", "10:00", "14:00", "15:00"] },
  { id: "2", name: "Dr. Michael Chen", specialty: "Dermatologist", rating: 4.8, experience: "12 years", available: ["10:00", "11:00", "16:00"] },
  { id: "3", name: "Dr. Emily Brown", specialty: "General Physician", rating: 4.7, experience: "8 years", available: ["09:00", "11:00", "13:00", "15:00", "17:00"] },
  { id: "4", name: "Dr. James Wilson", specialty: "Neurologist", rating: 4.9, experience: "20 years", available: ["10:00", "14:00"] },
  { id: "5", name: "Dr. Lisa Anderson", specialty: "Pediatrician", rating: 4.8, experience: "10 years", available: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      full: date.toISOString().split("T")[0],
    };
  });

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success("Appointment booked successfully!", {
      description: `${selectedDoctor.name} on ${selectedDate} at ${selectedTime}`,
    });
    
    navigate("/dashboard/patient");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              Book an <span className="text-gradient">Appointment</span>
            </h1>
            <p className="text-muted-foreground">
              Select a doctor, choose your preferred date and time
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            {[
              { num: 1, label: "Select Doctor" },
              { num: 2, label: "Choose Time" },
              { num: 3, label: "Confirm" },
            ].map(({ num, label }, index) => (
              <div key={num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step >= num
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > num ? <Check className="w-5 h-5" /> : num}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      step >= num ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all ${
                      step > num ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Choose Your Doctor
                </h2>
                <div className="grid gap-4">
                  {doctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedDoctor?.id === doctor.id
                            ? "border-primary bg-primary/5 shadow-glow"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center">
                              <User className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {doctor.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {doctor.specialty} • {doctor.experience}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{doctor.rating}</span>
                            </div>
                            {selectedDoctor?.id === doctor.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Select Date & Time
                </h2>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Choose a Date
                  </label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {dates.map((d) => (
                      <motion.button
                        key={d.full}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(d.full)}
                        className={`flex-shrink-0 w-20 p-4 rounded-2xl text-center transition-all ${
                          selectedDate === d.full
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <p className="text-xs font-medium opacity-70">{d.day}</p>
                        <p className="text-2xl font-bold mt-1">{d.date}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Available Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedDoctor?.available.map((time) => (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl text-center font-medium transition-all ${
                          selectedTime === time
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <GradientButton
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </GradientButton>
                  <GradientButton
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(3)}
                    disabled={!selectedDate || !selectedTime}
                    className="min-w-[150px]"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GradientButton>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Confirm Your Booking
                </h2>

                <AnimatedCard hover={false}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
                        <User className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground">
                          {selectedDoctor?.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedDoctor?.specialty}
                        </p>
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
                  </div>
                </AnimatedCard>

                <div className="flex justify-between pt-6">
                  <GradientButton
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </GradientButton>
                  <GradientButton
                    variant="primary"
                    size="lg"
                    onClick={handleBook}
                    disabled={isBooking}
                    className="min-w-[180px]"
                  >
                    {isBooking ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                        />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </GradientButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
