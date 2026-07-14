import mongoose from 'mongoose';
import { SCHEME_STATUS } from '../config/roles.js';

const schemeSchema = {
  name: String,
  status: { type: String, enum: SCHEME_STATUS, default: 'eligible' },
  reason: String,
  appliedDate: Date,
  approvedDate: Date,
};

const residentSchema = new mongoose.Schema(
  {
    residentId: { type: String, unique: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
    name: { type: String, required: true },
    photo: String,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    age: Number,
    dateOfBirth: Date,
    bloodGroup: String,
    mobile: String,
    aadhaarAvailable: { type: Boolean, default: false },
    aadhaarNumber: { type: String, select: false },
    disability: String,
    guardian: {
      name: String,
      relation: String,
      phone: String,
      address: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    health: {
      height: Number,
      weight: Number,
      bp: String,
      sugar: String,
      allergies: [String],
      medicalConditions: [String],
      mentalHealth: String,
      doctorAssigned: String,
      medicines: [{ name: String, dosage: String, frequency: String }],
      vaccinations: [{ name: String, date: Date }],
      lastCheckup: Date,
      nextCheckup: Date,
      reports: [String],
    },
    governmentSchemes: {
      oldAgePension: schemeSchema,
      widowPension: schemeSchema,
      disabilityPension: schemeSchema,
      ayushmanBharat: schemeSchema,
      arogyasri: schemeSchema,
      pmJanDhan: schemeSchema,
      foodSecurityCard: schemeSchema,
      rationCard: schemeSchema,
      aadhaarLinked: { type: Boolean, default: false },
      bankLinked: { type: Boolean, default: false },
    },
    financial: {
      pensionAmount: Number,
      pensionStatus: String,
      lastReceivedDate: Date,
      bankAccount: String,
      ifsc: String,
    },
    education: {
      schoolName: String,
      class: String,
      marks: String,
      scholarships: [String],
      college: String,
      skills: [String],
      interests: [String],
    },
    dailyRecords: [{
      date: Date,
      attendance: { type: Boolean, default: true },
      meals: { breakfast: Boolean, lunch: Boolean, dinner: Boolean },
      health: String,
      sleep: String,
      medicineTaken: Boolean,
    }],
    isActive: { type: Boolean, default: true },
    admittedDate: { type: Date, default: Date.now },
    dischargedDate: Date,
  },
  { timestamps: true }
);

residentSchema.pre('save', async function (next) {
  if (!this.residentId) {
    const count = await mongoose.model('Resident').countDocuments({ home: this.home });
    this.residentId = `RES-${Date.now().toString(36).toUpperCase()}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Resident', residentSchema);
