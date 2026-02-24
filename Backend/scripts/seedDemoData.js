import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { Faker, ar, de, en, en_IN, fr, ja, pt_BR } from "@faker-js/faker";
import { City, Country, State } from "country-state-city";

import connectDB from "../models/db.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCTOR_COUNT = Number(process.env.SEED_DOCTOR_COUNT || 50000);
const PATIENT_COUNT = Number(process.env.SEED_PATIENT_COUNT || 60000);
const APPOINTMENT_COUNT = Number(process.env.SEED_APPOINTMENT_COUNT || 70000);
const RESET_DATA = String(process.env.SEED_RESET || "true").toLowerCase() === "true";
const BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE || 2500);
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "CareConnect@123";

const TARGET_UNIQUE_CITIES = Number(process.env.SEED_TARGET_UNIQUE_CITIES || 3500);
const TARGET_UNIQUE_SUBCITIES = Number(process.env.SEED_TARGET_UNIQUE_SUBCITIES || 25000);

const fakerEN = new Faker({ locale: [en] });
const fakerENIN = new Faker({ locale: [en_IN, en] });
const fakerAR = new Faker({ locale: [ar, en] });
const fakerFR = new Faker({ locale: [fr, en] });
const fakerDE = new Faker({ locale: [de, en] });
const fakerJA = new Faker({ locale: [ja, en] });
const fakerPTBR = new Faker({ locale: [pt_BR, en] });

const specialties = [
  "Cardiologist", "Neurologist", "Dermatologist", "Orthopedic Surgeon", "Pediatrician", "Gynecologist",
  "Psychiatrist", "Ophthalmologist", "ENT Specialist", "Pulmonologist", "Oncologist", "Nephrologist",
  "Endocrinologist", "Gastroenterologist", "Urologist", "General Physician", "Rheumatologist", "Hematologist",
  "Immunologist", "Family Medicine", "Emergency Medicine", "Internal Medicine", "Sports Medicine", "Geriatrics",
  "Pain Medicine", "Dentist", "Diabetologist", "Physiotherapist", "Psychologist", "Andrologist",
];

const treatmentsOfferedPool = [
  "Medical consultation", "Follow-up care", "Lifestyle counseling", "Preventive screening", "Medication management",
  "Vaccination advice", "Chronic disease management", "Rehabilitation planning", "Dietary guidance", "Pain management",
  "Mental health counseling", "Post-surgery monitoring", "Teleconsultation", "Second opinion", "Procedure planning",
];

const diseasesHandledPool = [
  "Hypertension", "Diabetes", "Asthma", "Migraine", "Arthritis", "Thyroid disorders", "Skin infections",
  "Allergic rhinitis", "Acid reflux", "Depression", "Anxiety", "COPD", "Kidney stones", "PCOS", "Anemia",
  "Liver disorders", "Eye strain", "Sinusitis", "Obesity", "Back pain",
];

const proceduresPool = [
  "ECG interpretation", "Minor wound suturing", "Skin biopsy", "Nebulization", "Joint injection", "Endoscopy referral",
  "Blood pressure monitoring", "Diabetic foot assessment", "Pediatric growth assessment", "Pap smear screening",
  "Ultrasound guidance", "Vision screening", "Ear wax removal", "Counseling session", "Laser-assisted consultation",
  "Dental scaling", "Tooth extraction", "Root canal planning", "Fracture stabilization", "Physiotherapy regimen setup",
];

const skillsPool = [
  "Child specialist", "Laser procedure experience", "Critical care triage", "Telemedicine expert", "Geriatric care focus",
  "Sports injury rehab", "Pain intervention planning", "Women health specialist", "Diabetes educator", "Preventive medicine",
  "Post-op rehabilitation", "Mental wellness coaching", "Emergency stabilization", "Advanced diagnostics interpretation",
];

const languagePoolByRegion = {
  IN: ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali", "Punjabi", "Gujarati", "Urdu"],
  AE: ["Arabic", "English", "Hindi", "Urdu"],
  SA: ["Arabic", "English"],
  EG: ["Arabic", "English", "French"],
  PK: ["Urdu", "English", "Punjabi"],
  BD: ["Bengali", "English"],
  FR: ["French", "English"],
  DE: ["German", "English"],
  JP: ["Japanese", "English"],
  BR: ["Portuguese", "English", "Spanish"],
};

const achievementPool = [
  "Recognized for excellence in patient care",
  "Published peer-reviewed clinical research",
  "Speaker at international medical conference",
  "Awarded best clinician of the year",
  "Led successful community health outreach",
  "Trained junior doctors in advanced protocols",
  "Received hospital quality improvement award",
  "Completed advanced fellowship certification",
];

const appointmentProblemPool = [
  "Recurring headache with light sensitivity and nausea",
  "Persistent dry cough and breathlessness during night",
  "Uncontrolled blood sugar despite medication",
  "Severe lower back pain radiating to left leg",
  "Intermittent chest tightness after moderate activity",
  "Child with recurrent fever and appetite loss",
  "Skin rash with redness, itching, and burning",
  "Post-surgery wound review and pain management",
  "Sleep disturbance with daytime fatigue and anxiety",
  "Irregular menstrual cycle with abdominal cramps",
  "Frequent acidity, bloating, and post-meal discomfort",
  "Sudden vision blur with eye strain and watering",
  "Joint stiffness in morning affecting mobility",
  "Allergic sneezing with sinus pressure and headache",
  "Persistent neck pain from prolonged desk work",
  "Follow-up for hypertension and medication adjustment",
  "Palpitations and occasional dizziness episodes",
  "Childhood vaccination and growth monitoring consult",
  "Thyroid follow-up with weight and mood changes",
  "Depressive symptoms with low concentration",
  "Panic episodes and chest discomfort under stress",
  "Knee swelling after sports injury",
  "Urinary burning with flank discomfort",
  "Migraine episodes increasing in frequency",
  "Dental pain with sensitivity to hot and cold",
  "Tooth decay consultation and treatment planning",
  "Persistent acne with inflammatory lesions",
  "Ear fullness and reduced hearing in one side",
  "Nasal blockage and recurrent sinus infection",
  "Unexplained fatigue with mild anemia concern",
  "Obesity management and lifestyle counseling",
  "Post-viral weakness with reduced exercise tolerance",
  "Hand numbness and wrist pain (possible nerve compression)",
  "Digestive discomfort with alternating bowel habits",
  "Hair fall with scalp inflammation",
  "Shoulder pain with restricted arm movement",
  "Chronic constipation and abdominal discomfort",
  "Follow-up after fracture and rehabilitation",
  "Asthma inhaler review and symptom control",
  "Menopause-related sleep and mood concerns",
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const indiaFirstNames = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Kabir", "Ishaan", "Reyansh", "Vihaan", "Krishna", "Rudra",
  "Anaya", "Aadhya", "Diya", "Kiara", "Anika", "Myra", "Saanvi", "Ira", "Riya", "Meera",
  "Ayaan", "Zayan", "Rehan", "Faizan", "Arham", "Suhail", "Amaan", "Samir", "Imran", "Zubair",
  "Aisha", "Zara", "Sana", "Fatima", "Mariam", "Hiba", "Noor", "Aaliyah", "Inaya", "Safa",
  "Gurpreet", "Manpreet", "Harleen", "Simran", "Jasleen", "Amrit", "Karan", "Navjot", "Rajveer", "Mandeep",
  "Shruti", "Nandini", "Pranav", "Siddharth", "Yash", "Tanvi", "Bhavya", "Aarushi", "Rahul", "Neha",
  "Sameer", "Anirudh", "Pooja", "Ritika", "Anushka", "Vikram", "Raghav", "Harsh", "Roshni", "Aditi",
];

const indiaLastNames = [
  "Sharma", "Patel", "Singh", "Gupta", "Mehta", "Verma", "Joshi", "Nair", "Iyer", "Reddy",
  "Yadav", "Mishra", "Saxena", "Pandey", "Tiwari", "Agarwal", "Jain", "Chopra", "Malhotra", "Sinha",
  "Khan", "Ansari", "Shaikh", "Qureshi", "Syed", "Ali", "Hussain", "Farooqui", "Rizvi", "Pathan",
  "Kaur", "Gill", "Sandhu", "Brar", "Bedi", "Sodhi", "Dhillon", "Arora", "Chawla", "Batra",
  "Das", "Dutta", "Banerjee", "Mukherjee", "Chatterjee", "Bose", "Pillai", "Menon", "Kulkarni", "Deshmukh",
  "Pawar", "Chavan", "Shukla", "Tripathi", "Bhardwaj", "Goswami", "Mandal", "Roy", "Kamble", "Sawant",
];

const arabFirstNames = [
  "Omar", "Ahmed", "Youssef", "Khalid", "Hassan", "Mustafa", "Ibrahim", "Zayd", "Tariq", "Hamza",
  "Fatima", "Amina", "Mariam", "Noor", "Leila", "Huda", "Rania", "Salma", "Nadia", "Yasmin",
  "Abdullah", "Ammar", "Bilal", "Sami", "Noura", "Dina", "Aya", "Farah", "Layla", "Rashid",
];

const arabLastNames = [
  "Al Farsi", "Al Hammadi", "Al Mansoori", "Al Mazrouei", "Al Harbi", "Al Mutairi", "Al Otaibi", "Al Qahtani",
  "Haddad", "Khalil", "Nasser", "Rahman", "Karim", "Farouk", "Sabbagh", "Bakri", "Zahran", "Najjar",
  "Al Najjar", "Al Rashid", "Al Suwaidi", "Al Tayer", "Abdallah", "Hamdan", "Masri", "Kanaan",
];

const chineseMaleFirstNames = [
  "Wei", "Jian", "Hao", "Ming", "Tao", "Lei", "Peng", "Yong", "Jun", "Guang", "Bin", "Qiang",
  "Chao", "Xin", "Zhi", "Yu", "Bo", "Chen", "Rui", "Sheng", "Dong", "Feng", "Kai", "Tian",
];

const chineseFemaleFirstNames = [
  "Mei", "Li", "Xiu", "Lan", "Yue", "Na", "Fang", "Ling", "Yan", "Qin", "Jing", "Hui",
  "Xia", "Rong", "Ying", "Lian", "Ning", "Zhen", "Shan", "Xue", "Qiao", "Juan", "Min", "Pei",
];

const chineseLastNames = [
  "Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Zhao", "Huang", "Zhou", "Wu", "Xu", "Sun",
  "Ma", "Zhu", "Hu", "Guo", "He", "Gao", "Lin", "Luo", "Zheng", "Liang", "Xie", "Song",
];

const usUkChristianMale = [
  "James", "Michael", "William", "Daniel", "Matthew", "Joseph", "Andrew", "Thomas", "Samuel", "David",
  "Christopher", "Jonathan", "Ryan", "Nathan", "Benjamin", "Charles", "Henry", "Ethan", "Luke", "Adam",
];
const usUkChristianFemale = [
  "Mary", "Elizabeth", "Sarah", "Emily", "Hannah", "Grace", "Abigail", "Anna", "Sophie", "Charlotte",
  "Emma", "Olivia", "Laura", "Rachel", "Rebecca", "Martha", "Clara", "Amelia", "Ella", "Violet",
];
const usUkMuslimMale = [
  "Omar", "Yusuf", "Ibrahim", "Ayaan", "Bilal", "Hamza", "Zayd", "Ammar", "Idris", "Rayyan",
  "Khalid", "Sami", "Imran", "Farhan", "Nabil", "Rafiq", "Haris", "Tariq", "Nasir", "Karim",
];
const usUkMuslimFemale = [
  "Amina", "Fatima", "Zainab", "Noor", "Yasmin", "Maryam", "Layla", "Hafsa", "Sana", "Rania",
  "Aaliyah", "Safa", "Huda", "Samira", "Nadia", "Amira", "Mariam", "Salma", "Leila", "Inaya",
];
const usUkJewishMale = [
  "Noah", "Levi", "Eli", "Aaron", "Isaac", "Jacob", "Asher", "David", "Benjamin", "Samuel",
  "Nathan", "Ezra", "Micah", "Jonah", "Joshua", "Reuben", "Ari", "Meyer", "Saul", "Daniel",
];
const usUkJewishFemale = [
  "Leah", "Miriam", "Esther", "Hannah", "Sarah", "Ruth", "Naomi", "Rachel", "Talia", "Abigail",
  "Shira", "Ariella", "Eliana", "Yael", "Dina", "Aviva", "Deborah", "Rebecca", "Chava", "Liora",
];
const usUkCommonLastNames = [
  "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott", "Green",
];
const usUkMuslimLastNames = [
  "Khan", "Rahman", "Hussain", "Ali", "Ahmed", "Choudhury", "Mahmood", "Siddiqui", "Farooq", "Malik",
  "Qureshi", "Mirza", "Akhtar", "Iqbal", "Shaikh", "Ansari", "Raza", "Nadeem", "Latif", "Nawaz",
];
const usUkJewishLastNames = [
  "Cohen", "Levi", "Goldberg", "Rosenberg", "Katz", "Schwartz", "Friedman", "Kaplan", "Stein", "Weiss",
  "Klein", "Horowitz", "Shapiro", "Rubin", "Mendel", "Berman", "Stern", "Singer", "Kagan", "Silver",
];

const namingProfilesByCountry = {
  IN: [
    { religion: "Hindu", male: ["Aarav", "Vivaan", "Aditya", "Arjun", "Ishaan", "Rudra", "Pranav", "Siddharth", "Raghav", "Vikram"], female: ["Anaya", "Aadhya", "Diya", "Kiara", "Anika", "Myra", "Saanvi", "Ira", "Aditi", "Roshni"], last: ["Sharma", "Patel", "Gupta", "Verma", "Joshi", "Agarwal", "Mishra", "Pandey", "Kulkarni", "Deshmukh"] },
    { religion: "Muslim", male: ["Ayaan", "Zayan", "Rehan", "Faizan", "Arham", "Suhail", "Amaan", "Samir", "Imran", "Zubair"], female: ["Aisha", "Zara", "Sana", "Fatima", "Mariam", "Hiba", "Noor", "Aaliyah", "Inaya", "Safa"], last: ["Khan", "Ansari", "Shaikh", "Qureshi", "Syed", "Ali", "Hussain", "Farooqui", "Rizvi", "Pathan"] },
    { religion: "Sikh", male: ["Gurpreet", "Manpreet", "Amrit", "Karan", "Navjot", "Rajveer", "Mandeep", "Harjit", "Jasdeep", "Gurvinder"], female: ["Harleen", "Simran", "Jasleen", "Navneet", "Manjit", "Amrit", "Rupinder", "Rajinder", "Gurleen", "Kiran"], last: ["Singh", "Kaur", "Gill", "Sandhu", "Brar", "Bedi", "Sodhi", "Dhillon", "Chawla", "Batra"] },
    { religion: "Christian", male: ["Joseph", "Daniel", "Thomas", "Matthew", "David", "Samuel", "Peter", "John", "Paul", "Andrew"], female: ["Mary", "Elizabeth", "Grace", "Sarah", "Anna", "Rebecca", "Martha", "Ruth", "Hannah", "Clara"], last: ["D'Souza", "Fernandes", "Pinto", "Rozario", "Mathew", "Varghese", "Lobo", "D'Cruz", "Menezes", "Joseph"] },
  ],
  AE: [{ religion: "Muslim", male: arabFirstNames, female: ["Fatima", "Amina", "Mariam", "Noor", "Leila", "Huda", "Rania", "Salma", "Nadia", "Yasmin"], last: arabLastNames }],
  SA: [{ religion: "Muslim", male: arabFirstNames, female: ["Fatima", "Amina", "Mariam", "Noor", "Leila", "Huda", "Rania", "Salma", "Nadia", "Yasmin"], last: arabLastNames }],
  EG: [
    { religion: "Muslim", male: arabFirstNames, female: ["Fatima", "Amina", "Mariam", "Noor", "Leila", "Huda", "Rania", "Salma", "Nadia", "Yasmin"], last: arabLastNames },
    { religion: "Christian", male: ["Mina", "Bishoy", "Mark", "George", "Nader", "Youssef", "Ramy", "Peter", "Sameh", "Anton"], female: ["Mariam", "Christine", "Mona", "Nadine", "Marina", "Rita", "Sarah", "Dina", "Martha", "Eva"], last: ["Girgis", "Boutros", "Mikhail", "Farag", "Hanna", "Naguib", "Wassef", "Nashat", "Ishak", "Younan"] },
  ],
  CN: [
    { religion: "Chinese folk", male: chineseMaleFirstNames, female: chineseFemaleFirstNames, last: chineseLastNames },
  ],
  US: [
    { religion: "Christian", male: usUkChristianMale, female: usUkChristianFemale, last: usUkCommonLastNames },
    { religion: "Muslim", male: usUkMuslimMale, female: usUkMuslimFemale, last: usUkMuslimLastNames },
    { religion: "Jewish", male: usUkJewishMale, female: usUkJewishFemale, last: usUkJewishLastNames },
  ],
  GB: [
    { religion: "Christian", male: usUkChristianMale, female: usUkChristianFemale, last: usUkCommonLastNames },
    { religion: "Muslim", male: usUkMuslimMale, female: usUkMuslimFemale, last: usUkMuslimLastNames },
    { religion: "Jewish", male: usUkJewishMale, female: usUkJewishFemale, last: usUkJewishLastNames },
  ],
};

const countryConfigs = [
  { code: "IN", name: "India", weight: 0.42, faker: fakerENIN },
  { code: "CN", name: "China", weight: 0.10, faker: fakerEN },
  { code: "AE", name: "United Arab Emirates", weight: 0.05, faker: fakerAR },
  { code: "SA", name: "Saudi Arabia", weight: 0.04, faker: fakerAR },
  { code: "EG", name: "Egypt", weight: 0.03, faker: fakerAR },
  { code: "PK", name: "Pakistan", weight: 0.04, faker: fakerEN },
  { code: "BD", name: "Bangladesh", weight: 0.03, faker: fakerEN },
  { code: "US", name: "United States", weight: 0.06, faker: fakerEN },
  { code: "GB", name: "United Kingdom", weight: 0.04, faker: fakerEN },
  { code: "CA", name: "Canada", weight: 0.015, faker: fakerEN },
  { code: "AU", name: "Australia", weight: 0.01, faker: fakerEN },
  { code: "DE", name: "Germany", weight: 0.01, faker: fakerDE },
  { code: "FR", name: "France", weight: 0.01, faker: fakerFR },
  { code: "JP", name: "Japan", weight: 0.01, faker: fakerJA },
  { code: "SG", name: "Singapore", weight: 0.01, faker: fakerEN },
  { code: "BR", name: "Brazil", weight: 0.015, faker: fakerPTBR },
  { code: "ZA", name: "South Africa", weight: 0.01, faker: fakerEN },
  { code: "IT", name: "Italy", weight: 0.005, faker: fakerEN },
  { code: "ES", name: "Spain", weight: 0.005, faker: fakerEN },
  { code: "MX", name: "Mexico", weight: 0.005, faker: fakerEN },
  { code: "NG", name: "Nigeria", weight: 0.005, faker: fakerEN },
  { code: "KE", name: "Kenya", weight: 0.005, faker: fakerEN },
  { code: "TR", name: "Turkey", weight: 0.005, faker: fakerEN },
  { code: "TH", name: "Thailand", weight: 0.005, faker: fakerEN },
  { code: "ID", name: "Indonesia", weight: 0.005, faker: fakerEN },
  { code: "PH", name: "Philippines", weight: 0.005, faker: fakerEN },
  { code: "MY", name: "Malaysia", weight: 0.005, faker: fakerEN },
  { code: "VN", name: "Vietnam", weight: 0.005, faker: fakerEN },
  { code: "KR", name: "South Korea", weight: 0.005, faker: fakerEN },
  { code: "NL", name: "Netherlands", weight: 0.005, faker: fakerEN },
  { code: "SE", name: "Sweden", weight: 0.005, faker: fakerEN },
  { code: "CH", name: "Switzerland", weight: 0.005, faker: fakerEN },
  { code: "NZ", name: "New Zealand", weight: 0.005, faker: fakerEN },
];

const neighborhoodPools = {
  IN: ["Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "Saket", "Dwarka", "Rohini", "Karol Bagh", "Andheri", "Bandra", "Malad", "Goregaon", "Borivali", "Thane", "Salt Lake", "New Town", "Banjara Hills", "Jubilee Hills", "Ameerpet", "Gachibowli", "Viman Nagar", "Kothrud", "Baner", "Hadapsar", "Velachery", "Anna Nagar", "Adyar", "T Nagar", "Hinjewadi", "Kandivali", "Powai", "Chembur", "Rajajinagar", "Yelahanka", "HSR Layout", "Electronic City", "Civil Lines", "Sector 62", "Noida Extension", "Bopal"],
  CN: ["Chaoyang", "Haidian", "Pudong", "Xuhui", "Tianhe", "Nanshan", "Futian", "Huangpu", "Jianghan", "Yuhua"],
  AE: ["Deira", "Bur Dubai", "Al Barsha", "Jumeirah", "Business Bay", "Dubai Marina", "Al Nahda", "Mirdif", "Khalifa City"],
  SA: ["Olaya", "Al Malaz", "Al Rawdah", "Al Aziziyah", "Al Muruj", "Al Hamra", "Al Naseem", "Al Sulimaniyah"],
  EG: ["Nasr City", "Heliopolis", "Maadi", "Zamalek", "Dokki", "Mohandessin", "Shubra", "6th of October"],
  PK: ["Gulberg", "DHA", "Clifton", "Saddar", "Model Town", "Johar Town", "Bahria Town", "North Nazimabad"],
  BD: ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Mirpur", "Bashundhara", "Mohakhali", "Tejgaon"],
  US: ["Downtown", "Midtown", "Uptown", "Queens", "Brooklyn", "Santa Monica", "Pasadena", "Georgetown"],
  GB: ["Westminster", "Camden", "Hackney", "Greenwich", "Kensington", "Islington", "Southwark", "Brixton"],
  CA: ["North York", "Scarborough", "Etobicoke", "Downtown", "Burnaby", "Richmond", "Surrey", "Markham"],
  AU: ["Parramatta", "Bondi", "Chatswood", "Surry Hills", "Southbank", "Fitzroy", "St Kilda", "New Farm"],
  DE: ["Mitte", "Kreuzberg", "Neukölln", "Charlottenburg", "Altstadt", "Schwabing", "Eimsbüttel", "Bockenheim"],
  FR: ["Le Marais", "Montmartre", "La Défense", "Latin Quarter", "Belleville", "Bastille", "Part-Dieu", "Vieux Lyon"],
  JP: ["Shibuya", "Shinjuku", "Ginza", "Akihabara", "Ueno", "Ikebukuro", "Namba", "Tennoji"],
  SG: ["Jurong", "Woodlands", "Tampines", "Orchard", "Pasir Ris", "Punggol", "Bedok", "Toa Payoh"],
  BR: ["Pinheiros", "Moema", "Vila Mariana", "Itaim Bibi", "Copacabana", "Ipanema", "Barra", "Tijuca"],
  ZA: ["Sandton", "Rosebank", "Soweto", "Randburg", "Durban North", "Sea Point", "Centurion", "Bryanston"],
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dateOffsetIso = (daysFromToday) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const weightedPicker = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
};

const buildIdentity = (countryCode, fakerRef) => {
  const profiles = namingProfilesByCountry[countryCode] || [];
  if (profiles.length) {
    const profile = randomItem(profiles);
    const gender = randomItem(["male", "female"]);
    const first = gender === "male" ? randomItem(profile.male) : randomItem(profile.female);
    const last = randomItem(profile.last);
    return {
      fullName: `${first} ${last}`,
      firstName: first,
      lastName: last,
      gender,
      religion: profile.religion,
    };
  }

  const gender = randomItem(["male", "female"]);
  const first = fakerRef.person.firstName(gender);
  const last = fakerRef.person.lastName();
  return {
    fullName: `${first} ${last}`,
    firstName: first,
    lastName: last,
    gender,
    religion: "Unspecified",
  };
};

const buildCityCatalog = () => {
  const stateNameCache = new Map();
  const cityCatalog = [];
  const allCountryNames = new Map(Country.getAllCountries().map((entry) => [entry.isoCode, entry.name]));
  const selected = new Set(countryConfigs.map((c) => c.code));

  for (const config of countryConfigs) {
    const states = State.getStatesOfCountry(config.code) || [];
    const stateMap = new Map(states.map((s) => [s.isoCode, s.name]));
    stateNameCache.set(config.code, stateMap);

    const cities = City.getCitiesOfCountry(config.code) || [];
    for (const city of cities) {
      if (!city.latitude || !city.longitude) continue;
      cityCatalog.push({
        countryCode: config.code,
        country: allCountryNames.get(config.code) || config.name,
        city: city.name,
        state: stateMap.get(city.stateCode) || city.stateCode || "",
        lat: Number(city.latitude),
        lng: Number(city.longitude),
      });
    }
  }

  const uniqueCityKeys = new Set(cityCatalog.map((c) => `${c.countryCode}:${c.city.toLowerCase()}`));
  if (uniqueCityKeys.size < TARGET_UNIQUE_CITIES) {
    const allCities = City.getAllCities() || [];
    for (const city of allCities) {
      if (!city.latitude || !city.longitude) continue;
      const countryCode = city.countryCode;
      if (selected.has(countryCode)) continue;
      const key = `${countryCode}:${city.name.toLowerCase()}`;
      if (uniqueCityKeys.has(key)) continue;
      uniqueCityKeys.add(key);

      const stateMap = stateNameCache.get(countryCode) || new Map((State.getStatesOfCountry(countryCode) || []).map((s) => [s.isoCode, s.name]));
      stateNameCache.set(countryCode, stateMap);

      cityCatalog.push({
        countryCode,
        country: allCountryNames.get(countryCode) || countryCode,
        city: city.name,
        state: stateMap.get(city.stateCode) || city.stateCode || "",
        lat: Number(city.latitude),
        lng: Number(city.longitude),
      });

      if (uniqueCityKeys.size >= TARGET_UNIQUE_CITIES) break;
    }
  }

  return cityCatalog;
};

const CITY_CATALOG = buildCityCatalog();
const CITY_BY_COUNTRY = CITY_CATALOG.reduce((acc, entry) => {
  if (!acc.has(entry.countryCode)) acc.set(entry.countryCode, []);
  acc.get(entry.countryCode).push(entry);
  return acc;
}, new Map());

const chooseCity = (countryCode) => {
  const pool = CITY_BY_COUNTRY.get(countryCode);
  if (pool?.length) return randomItem(pool);
  return randomItem(CITY_CATALOG);
};

const buildAddressLine1 = (countryCode, city, fakerRef) => {
  if (countryCode !== "IN") return fakerRef.location.streetAddress();
  const indiaRoads = ["MG Road", "Brigade Road", "Ring Road", "Link Road", "Park Street", "Station Road", "Temple Road", "LBS Marg", "SV Road", "Outer Ring Road", "NH Service Road", "College Road", "Airport Road", "Canal Road", "Bazaar Road", "Market Road", "Nehru Road", "Tilak Road", "Residency Road", "Church Road"];
  const indiaBlocks = ["Nagar", "Colony", "Layout", "Enclave", "Extension", "Phase", "Sector", "Gali", "Pura", "Society"];
  return `${randomInt(1, 999)} ${randomItem(indiaRoads)}, ${randomItem(indiaBlocks)} ${randomInt(1, 400)}, ${city}`;
};

const buildSubCity = (countryCode, city, state) => {
  const pool = neighborhoodPools[countryCode] || [];
  const part = pool.length ? randomItem(pool) : state || "Central";
  return `${part} ${randomInt(1, 900)}, ${city}`;
};

const buildAddressAndLocation = (countryCode, fakerRef) => {
  const cityProfile = chooseCity(countryCode);
  const city = cityProfile.city;
  const state = cityProfile.state || city;
  const country = cityProfile.country;
  const subCity = buildSubCity(countryCode, city, state);
  const line1 = buildAddressLine1(countryCode, city, fakerRef);

  const lat = Number((cityProfile.lat + (Math.random() - 0.5) * 0.15).toFixed(6));
  const lng = Number((cityProfile.lng + (Math.random() - 0.5) * 0.15).toFixed(6));

  return {
    countryCode,
    city,
    subCity,
    country,
    address: {
      line1,
      subCity,
      city,
      country,
      postalCode: fakerRef.location.zipCode(),
    },
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  };
};

const pickLanguages = (countryCode) => {
  const pool = languagePoolByRegion[countryCode] || ["English", "Spanish", "French", "Arabic", "Hindi"];
  const take = randomInt(1, Math.min(4, pool.length));
  return [...pool].sort(() => 0.5 - Math.random()).slice(0, take);
};

const toSlotLabel = (minutes) => {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const buildSchedule = () => {
  const slotDurationMinutes = randomItem([10, 15, 20, 30]);
  const start = randomItem(["08:00", "08:30", "09:00", "09:30", "10:00"]);
  const end = randomItem(["16:00", "17:00", "18:00", "19:00", "20:00"]);

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  const available = [];
  for (let current = startMins; current + slotDurationMinutes <= endMins; current += slotDurationMinutes) {
    available.push(toSlotLabel(current));
  }

  const dayPool = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysCount = randomInt(4, 6);
  const availableDays = [...dayPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, daysCount)
    .sort((a, b) => dayPool.indexOf(a) - dayPool.indexOf(b));

  return {
    availableDays,
    workingHours: { start, end },
    slotDurationMinutes,
    available,
    maxPatientsPerDay: Math.max(8, Math.min(70, randomInt(15, 55))),
  };
};

const randomDobAndAge = () => {
  const age = randomInt(28, 72);
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = String(randomInt(1, 12)).padStart(2, "0");
  const day = String(randomInt(1, 28)).padStart(2, "0");
  return { age, dateOfBirth: `${year}-${month}-${day}` };
};

const pickSubset = (pool, min = 2, max = 5) => {
  const count = randomInt(min, Math.min(max, pool.length));
  return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
};

const buildDoctorNarratives = (name, specialty, city, religion) => ({
  aboutDoctor: `${name} is a ${specialty.toLowerCase()} practicing in ${city}, focused on safe and evidence-based care${religion ? ` with culturally sensitive communication` : ""}.`,
  treatmentPhilosophy: randomItem([
    "Patient-first, transparent, and prevention-focused care.",
    "Evidence-based treatment with strong patient education.",
    "Minimal intervention with maximum long-term health outcomes.",
    "Holistic care balancing diagnostics, medication, and lifestyle.",
  ]),
  experienceSummary: `${name} has managed diverse outpatient and follow-up cases in ${specialty.toLowerCase()} across urban clinics and hospitals.`,
});

const buildAppointmentRules = () => ({
  allowWalkIn: Math.random() < 0.35,
  cancellationWindowHours: randomItem([6, 12, 24, 36, 48]),
  requiresPrepayment: Math.random() < 0.2,
  preConsultationNotes: randomItem([
    "Bring previous medical reports and current prescriptions.",
    "Arrive 15 minutes early for registration and vitals.",
    "Share recent lab results for better assessment.",
    "Maintain fasting if advised for blood-related tests.",
  ]),
  noShowPolicy: randomItem([
    "Repeated no-shows may affect future priority booking.",
    "Please cancel in advance to free slots for other patients.",
    "No-show fees may apply as per clinic policy.",
    "Three no-shows may require prepayment for next booking.",
  ]),
});

const buildReviews = (fakerRef) => {
  const reviewCount = randomInt(0, 6);
  const reviews = [];
  for (let index = 0; index < reviewCount; index += 1) {
    const rating = randomInt(3, 5);
    reviews.push({
      patientName: `${fakerRef.person.firstName()} ${fakerRef.person.lastName()}`,
      rating,
      comment: randomItem([
        "Very clear explanation and helpful guidance.",
        "Doctor listened patiently and treatment worked well.",
        "Professional consultation and smooth follow-up.",
        "Felt comfortable discussing all symptoms.",
        "Good clinic support and timely appointment.",
      ]),
      date: dateOffsetIso(randomInt(-500, -10)),
    });
  }

  const average = reviews.length
    ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
    : Number((Math.random() * 1.5 + 3.2).toFixed(1));

  return { reviews, averageRating: average };
};

const statusWeightPick = () => {
  const roll = Math.random();
  if (roll < 0.12) return "cancelled";
  if (roll < 0.48) return "completed";
  if (roll < 0.78) return "confirmed";
  return "pending";
};

const pickDateForDoctor = (availableDays) => {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const offset = randomInt(-30, 120);
    const date = dateOffsetIso(offset);
    const weekday = dayLabels[new Date(`${date}T00:00:00`).getDay()];
    if (availableDays.includes(weekday)) return date;
  }

  return dateOffsetIso(randomInt(-30, 120));
};

const writeSummaryFiles = ({ outputDir, doctorSamples, patientSamples, stats }) => {
  const doctorFile = path.join(outputDir, "doctors_credentials.json");
  const userFile = path.join(outputDir, "users_credentials.json");
  const guideFile = path.join(outputDir, "LOGIN_CREDENTIALS.md");

  fs.writeFileSync(doctorFile, JSON.stringify(doctorSamples, null, 2), "utf-8");
  fs.writeFileSync(userFile, JSON.stringify(patientSamples, null, 2), "utf-8");

  const doctorLines = doctorSamples
    .slice(0, 20)
    .map((d, idx) => `${idx + 1}. ${d.name} | ${d.email} | ${d.city}, ${d.country}`)
    .join("\n");
  const patientLines = patientSamples
    .slice(0, 20)
    .map((d, idx) => `${idx + 1}. ${d.name} | ${d.email} | ${d.city}, ${d.country}`)
    .join("\n");

  const guide = `# CareConnect Global Seed Credentials\n\nUse **email + password** for login.\n\n- Default password for ALL seeded users: ${DEFAULT_PASSWORD}\n- Doctor email pattern: dr.<6-digit-number>@careconnect.world\n- Patient email pattern: pt.<6-digit-number>@careconnect.world\n\n## Diversity Stats\n- Unique cities generated: ${stats.uniqueCities}\n- Unique sub-cities generated: ${stats.uniqueSubCities}\n\n## Sample Doctors\n${doctorLines}\n\n## Sample Patients\n${patientLines}\n`;

  fs.writeFileSync(guideFile, guide, "utf-8");
};

const run = async () => {
  try {
    await connectDB();

    if (RESET_DATA) {
      await Appointment.deleteMany({});
      await Doctor.deleteMany({});
      await User.deleteMany({});
      console.log("🧹 Existing User/Doctor/Appointment data removed.");
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const patientUserIds = [];
    const doctorMetaList = [];
    const doctorSampleCredentials = [];
    const patientSampleCredentials = [];

    const uniqueCities = new Set();
    const uniqueSubCities = new Set();

    console.log(
      `🌍 City catalog prepared with ${new Set(CITY_CATALOG.map((c) => `${c.countryCode}:${c.city.toLowerCase()}`)).size} unique city entries.`
    );

    console.log("👨‍⚕️ Creating doctor users + profiles...");
    for (let start = 1; start <= DOCTOR_COUNT; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, DOCTOR_COUNT);
      const userBatch = [];
      const preparedDoctorData = [];

      for (let i = start; i <= end; i += 1) {
        const countryConfig = weightedPicker(countryConfigs);
        const fakerRef = countryConfig.faker;
        const identity = buildIdentity(countryConfig.code, fakerRef);
        const name = identity.fullName;
        const geo = buildAddressAndLocation(countryConfig.code, fakerRef);
        const email = `dr.${String(i).padStart(6, "0")}@careconnect.world`;
        const schedule = buildSchedule();
        const { age, dateOfBirth } = randomDobAndAge();
        const { reviews, averageRating } = buildReviews(fakerRef);
        const specialty = specialties[(start + i) % specialties.length];
        const yearsOfExperience = randomInt(2, Math.max(3, age - 26));
        const narratives = buildDoctorNarratives(name, specialty, geo.city, identity.religion);

        uniqueCities.add(`${geo.country}:${geo.city}`);
        uniqueSubCities.add(`${geo.country}:${geo.subCity}`);

        userBatch.push({
          name,
          email,
          password: hashedPassword,
          phone: fakerRef.phone.number("+## ##########"),
          religion: identity.religion,
          role: "doctor",
          isVerified: true,
          address: geo.address,
          location: geo.location,
        });

        preparedDoctorData.push({
          name,
          fullName: name,
          religion: identity.religion,
          gender: identity.gender,
          dateOfBirth,
          age,
          contactNumber: fakerRef.phone.number("+## ##########"),
          email,
          specialty,
          specialization: specialty,
          yearsOfExperience,
          experience: `${yearsOfExperience} years`,
          medicalLicenseNumber: `${countryConfig.code}-ML-${String(i).padStart(8, "0")}`,
          rating: averageRating,
          averageRating,
          available: schedule.available,
          availableDays: schedule.availableDays,
          workingHours: schedule.workingHours,
          slotDurationMinutes: schedule.slotDurationMinutes,
          maxPatientsPerDay: schedule.maxPatientsPerDay,
          bio: narratives.aboutDoctor,
          qualifications: pickSubset(["MBBS", "BDS", "MD", "MS", "DNB", "DM", "MCh", "FRCS", "FACS"], 2, 4),
          consultationFee: randomInt(20, 650),
          consultationFeePhysicalVisit: randomInt(20, 650),
          clinicName: `${fakerRef.company.name()} Health Center`,
          treatmentsOffered: pickSubset(treatmentsOfferedPool, 4, 8),
          diseasesHandled: pickSubset(diseasesHandledPool, 4, 8),
          proceduresPerformed: pickSubset(proceduresPool, 3, 7),
          languagesSpoken: pickLanguages(countryConfig.code),
          specialSkills: pickSubset(skillsPool, 2, 5),
          aboutDoctor: narratives.aboutDoctor,
          treatmentPhilosophy: narratives.treatmentPhilosophy,
          experienceSummary: `${narratives.experienceSummary} Community context: ${identity.religion}.`,
          achievementsAwards: pickSubset(achievementPool, 1, 4),
          patientReviews: reviews,
          totalAppointments: 0,
          successRate: Number((Math.random() * 25 + 70).toFixed(1)),
          cancellationRate: Number((Math.random() * 12).toFixed(1)),
          appointmentRules: buildAppointmentRules(),
          isAvailable: true,
          address: geo.address,
          location: geo.location,
        });

        if (doctorSampleCredentials.length < 300) {
          doctorSampleCredentials.push({ name, email, password: DEFAULT_PASSWORD, city: geo.city, country: geo.country });
        }
      }

      const createdUsers = await User.insertMany(userBatch, { ordered: true });

      const doctorBatch = createdUsers.map((user, idx) => ({
        ...preparedDoctorData[idx],
        userId: user._id,
        contactNumber: user.phone,
        email: user.email,
        address: user.address,
        location: user.location,
      }));

      const createdDoctors = await Doctor.insertMany(doctorBatch, { ordered: true });
      createdDoctors.forEach((doctorDoc) => {
        doctorMetaList.push({
          id: String(doctorDoc._id),
          slots: doctorDoc.available,
          availableDays: doctorDoc.availableDays,
          maxPatientsPerDay: doctorDoc.maxPatientsPerDay,
        });
      });

      console.log(`   Doctors seeded: ${end}/${DOCTOR_COUNT}`);
    }

    console.log("👤 Creating patient users...");
    for (let start = 1; start <= PATIENT_COUNT; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, PATIENT_COUNT);
      const patientBatch = [];

      for (let i = start; i <= end; i += 1) {
        const countryConfig = weightedPicker(countryConfigs);
        const fakerRef = countryConfig.faker;
        const identity = buildIdentity(countryConfig.code, fakerRef);
        const name = identity.fullName;
        const geo = buildAddressAndLocation(countryConfig.code, fakerRef);
        const email = `pt.${String(i).padStart(6, "0")}@careconnect.world`;

        uniqueCities.add(`${geo.country}:${geo.city}`);
        uniqueSubCities.add(`${geo.country}:${geo.subCity}`);

        patientBatch.push({
          name,
          email,
          password: hashedPassword,
          phone: fakerRef.phone.number("+## ##########"),
          religion: identity.religion,
          role: "patient",
          isVerified: true,
          address: geo.address,
          location: geo.location,
        });

        if (patientSampleCredentials.length < 300) {
          patientSampleCredentials.push({ name, email, password: DEFAULT_PASSWORD, city: geo.city, country: geo.country });
        }
      }

      const createdPatients = await User.insertMany(patientBatch, { ordered: true });
      createdPatients.forEach((patient) => patientUserIds.push(patient._id));

      console.log(`   Patients seeded: ${end}/${PATIENT_COUNT}`);
    }

    const dayLoadByDoctorDate = new Map();
    const slotTakenByDoctorDateTime = new Set();
    const doctorStats = new Map();

    console.log("📅 Creating appointments with doctor capacity and slot rules...");
    for (let start = 0; start < APPOINTMENT_COUNT; start += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, APPOINTMENT_COUNT - start);
      const appointments = [];

      for (let i = 0; i < batchSize; i += 1) {
        let selected = null;

        for (let attempt = 0; attempt < 30; attempt += 1) {
          const doctorMeta = randomItem(doctorMetaList);
          const date = pickDateForDoctor(doctorMeta.availableDays);
          const dailyKey = `${doctorMeta.id}|${date}`;
          const currentLoad = dayLoadByDoctorDate.get(dailyKey) || 0;
          if (currentLoad >= doctorMeta.maxPatientsPerDay) continue;

          if (!doctorMeta.slots.length) continue;
          const time = randomItem(doctorMeta.slots);
          const slotKey = `${doctorMeta.id}|${date}|${time}`;
          if (slotTakenByDoctorDateTime.has(slotKey)) continue;

          selected = { doctorId: doctorMeta.id, date, time };
          dayLoadByDoctorDate.set(dailyKey, currentLoad + 1);
          slotTakenByDoctorDateTime.add(slotKey);
          break;
        }

        if (!selected) {
          const doctorMeta = randomItem(doctorMetaList);
          const date = pickDateForDoctor(doctorMeta.availableDays);
          const fallbackTime = doctorMeta.slots[0] || "09:00 AM";
          selected = { doctorId: doctorMeta.id, date, time: fallbackTime };
        }

        const status = statusWeightPick();
        const problem = randomItem(appointmentProblemPool);

        appointments.push({
          patientId: randomItem(patientUserIds),
          doctorId: selected.doctorId,
          date: selected.date,
          time: selected.time,
          status,
          notes: randomItem([
            "Patient requested consultation after recurring symptoms.",
            "Follow-up visit requested with previous prescription review.",
            "Initial diagnosis and treatment planning appointment.",
            "Routine check-up with additional reports discussion.",
          ]),
          symptoms: problem,
          problem,
        });

        const currentDoctorStat = doctorStats.get(selected.doctorId) || { total: 0, cancelled: 0, completed: 0 };
        currentDoctorStat.total += 1;
        if (status === "cancelled") currentDoctorStat.cancelled += 1;
        if (status === "completed") currentDoctorStat.completed += 1;
        doctorStats.set(selected.doctorId, currentDoctorStat);
      }

      await Appointment.insertMany(appointments, { ordered: false });
      console.log(`   Appointments seeded: ${Math.min(start + batchSize, APPOINTMENT_COUNT)}/${APPOINTMENT_COUNT}`);
    }

    console.log("📊 Updating doctor analytics fields...");
    const doctorUpdates = [];
    for (const [doctorId, stat] of doctorStats.entries()) {
      const successRate = stat.total ? Number(((stat.completed / stat.total) * 100).toFixed(1)) : 0;
      const cancellationRate = stat.total ? Number(((stat.cancelled / stat.total) * 100).toFixed(1)) : 0;
      doctorUpdates.push({
        updateOne: {
          filter: { _id: doctorId },
          update: {
            $set: {
              totalAppointments: stat.total,
              successRate,
              cancellationRate,
            },
          },
        },
      });
    }

    for (let index = 0; index < doctorUpdates.length; index += BATCH_SIZE) {
      const chunk = doctorUpdates.slice(index, index + BATCH_SIZE);
      if (chunk.length) await Doctor.bulkWrite(chunk, { ordered: false });
    }

    const outputDir = path.resolve(__dirname, "generated_credentials");
    ensureDir(outputDir);

    writeSummaryFiles({
      outputDir,
      doctorSamples: doctorSampleCredentials,
      patientSamples: patientSampleCredentials,
      stats: {
        uniqueCities: uniqueCities.size,
        uniqueSubCities: uniqueSubCities.size,
      },
    });

    console.log("✅ Global seed completed successfully");
    console.log(`👨‍⚕️ Doctors created: ${DOCTOR_COUNT}`);
    console.log(`👤 Patients created: ${PATIENT_COUNT}`);
    console.log(`📅 Appointments created: ${APPOINTMENT_COUNT}`);
    console.log(`🏙️ Unique cities used: ${uniqueCities.size}`);
    console.log(`🏘️ Unique sub-cities used: ${uniqueSubCities.size}`);
    console.log(`🔐 Default password: ${DEFAULT_PASSWORD}`);
    console.log(`📁 Samples: ${path.join(outputDir, "LOGIN_CREDENTIALS.md")}`);

    if (uniqueCities.size < TARGET_UNIQUE_CITIES) {
      console.warn(`⚠️ Unique city count ${uniqueCities.size} is below target ${TARGET_UNIQUE_CITIES}.`);
    }
    if (uniqueSubCities.size < TARGET_UNIQUE_SUBCITIES) {
      console.warn(`⚠️ Unique sub-city count ${uniqueSubCities.size} is below target ${TARGET_UNIQUE_SUBCITIES}.`);
    }
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

run();
