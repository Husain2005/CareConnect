import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Search, Star, Stethoscope, Calendar, Filter, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = "http://localhost:5000";

type Doctor = {
  _id: string;
  name: string;
  specialty: string;
  rating: number;
  averageRating?: number;
  totalAppointments?: number;
  experience?: string;
  available: string[];
  bio?: string;
  qualifications?: string[];
  consultationFee?: number;
  distanceKm?: number;
  address?: {
    line1?: string;
    subCity?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
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

const FindDoctorsPage = () => {
  const PAGE_LIMIT = 24;
  const specialtyOptions = [
    "All",
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Gynecologist",
    "Psychiatrist",
    "Ophthalmologist",
    "ENT Specialist",
    "Pulmonologist",
    "Oncologist",
    "Nephrologist",
    "Endocrinologist",
    "Gastroenterologist",
    "Urologist",
    "General Physician",
    "Family Medicine",
    "Dentist",
  ];

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [subCity, setSubCity] = useState("");
  const [language, setLanguage] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [maxFee, setMaxFee] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "fee" | "experience">("relevance");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usingMyLocation, setUsingMyLocation] = useState(false);
  const [strictRadius, setStrictRadius] = useState(false);
  const [radiusKm, setRadiusKm] = useState(30);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookedCountByDoctorToday, setBookedCountByDoctorToday] = useState<Map<string, number>>(new Map());

  const fetchDoctors = async (targetPage: number, reset = false) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_LIMIT),
      });

      if (query.trim()) params.set("query", query.trim());
      if (specialty !== "All") params.set("specialty", specialty);
      if (country.trim()) params.set("country", country.trim());
      if (city.trim()) params.set("city", city.trim());
      if (subCity.trim()) params.set("subCity", subCity.trim());
      if (language.trim()) params.set("language", language.trim());
      if (minRating > 0) params.set("minRating", String(minRating));
      if (maxFee.trim()) params.set("maxFee", maxFee.trim());
      params.set("sortBy", sortBy);
      if (usingMyLocation && coords) {
        params.set("userLat", String(coords.lat));
        params.set("userLng", String(coords.lng));
        params.set("radiusKm", String(radiusKm));
        params.set("strictRadius", strictRadius ? "1" : "0");
      }

      const response = await fetch(`${API_URL}/api/doctor?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data: DoctorApiResponse | Doctor[] = await response.json();
      const items = Array.isArray(data) ? data : data.items || [];
      const pages = Array.isArray(data) ? 1 : data.pagination?.totalPages || 1;
      const total = Array.isArray(data) ? items.length : data.pagination?.total || items.length;

      setTotalPages(pages);
      setPage(targetPage);
      setTotalCount(total);
      setDoctors((prev) => (reset ? items : [...prev, ...items]));
    } catch {
      toast.error("Could not load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, true);
    }, 250);

    return () => clearTimeout(timer);
  }, [
    query,
    specialty,
    country,
    city,
    subCity,
    language,
    minRating,
    maxFee,
    sortBy,
    usingMyLocation,
    strictRadius,
    radiusKm,
    coords?.lat,
    coords?.lng,
  ]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUsingMyLocation(true);
        toast.success("Using your location to show nearest doctors");
      },
      () => toast.error("Unable to access your location")
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !doctors.length) {
      setBookedCountByDoctorToday(new Map());
      return;
    }

    const fetchDoctorLoad = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const doctorIds = doctors.map((doctor) => doctor._id).join(",");
        if (!doctorIds) return;

        const response = await fetch(`${API_URL}/api/appointments/doctor-load?date=${today}&doctorIds=${doctorIds}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const data = await response.json();
        const counts = data?.counts || {};
        const map = new Map<string, number>();
        Object.entries(counts).forEach(([doctorId, count]) => {
          map.set(doctorId, Number(count) || 0);
        });
        setBookedCountByDoctorToday(map);
      } catch {
      }
    };

    fetchDoctorLoad();
  }, [doctors]);

  const specialties = useMemo(() => specialtyOptions, []);

  return (
    <>
      <DashboardHeader
        role="patient"
        title="Find Doctors"
        subtitle="Search specialists and move directly to booking."
      />

      <div className="space-y-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by doctor name or specialty"
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground appearance-none"
            >
              {specialties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* <div className="grid md:grid-cols-4 gap-3">
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country"
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          />
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="City"
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          />
          <input
            value={subCity}
            onChange={(event) => setSubCity(event.target.value)}
            placeholder="Sub city"
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          />
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="Language"
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          />
        </div> */}

        <div className="grid md:grid-cols-4 gap-3">
          <select
            value={String(minRating)}
            onChange={(event) => setMinRating(Number(event.target.value))}
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          >
            {[0, 3, 3.5, 4, 4.5].map((option) => (
              <option key={option} value={option}>
                {option === 0 ? "Any rating" : `${option}+ rating`}
              </option>
            ))}
          </select>

          <input
            value={maxFee}
            onChange={(event) => setMaxFee(event.target.value.replace(/[^\d]/g, ""))}
            placeholder="Max fee"
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "relevance" | "rating" | "fee" | "experience")}
            className="px-3 py-2.5 bg-card border border-border rounded-xl text-foreground"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Highest rating</option>
            <option value="fee">Sort: Lowest fee</option>
            <option value="experience">Sort: Experience</option>
          </select>

          <button
            onClick={() => {
              setQuery("");
              setSpecialty("All");
              setCountry("");
              setCity("");
              setSubCity("");
              setLanguage("");
              setMinRating(0);
              setMaxFee("");
              setSortBy("relevance");
            }}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground"
          >
            Reset filters
          </button>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading doctors..." : `Showing ${doctors.length} doctors`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={requestLocation}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" /> Use my location
            </button>
            {usingMyLocation && (
              <>
                <label className="text-xs text-muted-foreground flex items-center gap-2 px-2">
                  <input
                    type="checkbox"
                    checked={strictRadius}
                    onChange={(event) => setStrictRadius(event.target.checked)}
                  />
                  Limit to radius
                </label>
                <input
                  value={radiusKm}
                  onChange={(event) => {
                    const value = Number(event.target.value.replace(/[^\d]/g, ""));
                    setRadiusKm(Number.isFinite(value) && value > 0 ? value : 30);
                  }}
                  className="w-20 px-2 py-2 rounded-lg border border-border bg-card text-foreground"
                  aria-label="radius"
                />
                <button
                  onClick={() => {
                    setUsingMyLocation(false);
                    setCoords(null);
                    setStrictRadius(false);
                  }}
                  className="px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                >
                  Clear location
                </button>
              </>
            )}
          </div>
        </div>

        {usingMyLocation && !strictRadius && (
          <p className="text-xs text-muted-foreground">Location is used for distance sorting only. All matching records remain searchable.</p>
        )}

        {!loading && doctors.length === 0 ? (
          <div className="border border-border rounded-2xl bg-card p-10 text-center">
            <p className="text-lg font-semibold text-foreground mb-1">No doctors match your filters</p>
            <p className="text-sm text-muted-foreground">Try another specialty or remove the search term.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              (() => {
                const bookedToday = bookedCountByDoctorToday.get(doctor._id) || 0;
                const totalSlots = doctor.available?.length || 0;
                const fullyBookedToday = totalSlots > 0 && bookedToday >= totalSlots;
                const doctorRating = Number(doctor.averageRating ?? doctor.rating ?? 0);
                const addressText = [
                  doctor.address?.subCity,
                  doctor.address?.city,
                  doctor.address?.country,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
              <div key={doctor._id} className="border border-border rounded-2xl bg-card p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">{doctorRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium text-foreground">{doctor.experience || "Not specified"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 border border-border px-3 py-2">
                    <p className="text-xs text-muted-foreground">Distance / Slots</p>
                    <p className="font-medium text-foreground">{doctor.distanceKm ? `${doctor.distanceKm} km • ` : ""}{doctor.available?.length || 0}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {addressText || "Address unavailable"}
                </p>

                <p className="text-xs text-muted-foreground mb-4">
                  {doctor.totalAppointments ? `${doctor.totalAppointments} appointments handled` : "Newly listed doctor"}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full py-2.5 rounded-xl font-medium border border-border bg-card text-foreground"
                  >
                    See details
                  </button>
                  <button
                    onClick={() =>
                      !fullyBookedToday &&
                      navigate(`/dashboard/patient/book?doctorId=${doctor._id}`, {
                        state: { selectedDoctor: doctor },
                      })
                    }
                    disabled={fullyBookedToday}
                    className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 ${
                      fullyBookedToday
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-foreground text-background"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {fullyBookedToday ? "Fully booked" : "Book now"}
                  </button>
                </div>
              </div>
                );
              })()
            ))}
          </div>
        )}

        {!loading && (
          <div className="text-center text-sm text-muted-foreground">
            Loaded {doctors.length} of {totalCount} doctors
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => fetchDoctors(page + 1)}
              className="px-5 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary"
            >
              Show more doctors
            </button>
          </div>
        )}

        <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
          <DialogContent className="max-w-3xl">
            {selectedDoctor && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedDoctor.name}</DialogTitle>
                  <DialogDescription>
                    {selectedDoctor.specialty} • {selectedDoctor.experience || "Experience not specified"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {[selectedDoctor.address?.line1, selectedDoctor.address?.subCity, selectedDoctor.address?.city, selectedDoctor.address?.country]
                      .filter(Boolean)
                      .join(", ") || "Address unavailable"}
                  </p>
                  <p>Consultation fee: {selectedDoctor.consultationFee ? `₹${selectedDoctor.consultationFee}` : "Not specified"}</p>
                  {selectedDoctor.bio && <p>{selectedDoctor.bio}</p>}
                </div>

                <div className="rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="Doctor location map"
                    width="100%"
                    height="280"
                    loading="lazy"
                    src={
                      selectedDoctor.location?.coordinates?.length === 2 &&
                      (selectedDoctor.location.coordinates[0] !== 0 || selectedDoctor.location.coordinates[1] !== 0)
                        ? `https://www.google.com/maps?q=${selectedDoctor.location.coordinates[1]},${selectedDoctor.location.coordinates[0]}&z=13&output=embed`
                        : `https://www.google.com/maps?q=${encodeURIComponent(
                            [
                              selectedDoctor.address?.line1,
                              selectedDoctor.address?.subCity,
                              selectedDoctor.address?.city,
                              selectedDoctor.address?.country,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          )}&z=13&output=embed`
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/patient/book?doctorId=${selectedDoctor._id}`, {
                        state: { selectedDoctor },
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-foreground text-background"
                  >
                    Book this doctor
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default FindDoctorsPage;
