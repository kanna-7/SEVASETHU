import mongoose from 'mongoose';

const medicalCampSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalName: String,
    date: { type: Date, required: true },
    endDate: Date,
    location: {
      address: String,
      city: String,
      lat: Number,
      lng: Number,
    },
    homes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }],
    registeredResidents: [{
      resident: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
      home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
      attended: { type: Boolean, default: false },
      doctorReport: String,
      medicines: [{ name: String, dosage: String }],
      images: [String],
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    images: [String],
    doctors: [String],
    specializations: [String],
  },
  { timestamps: true }
);

export default mongoose.model('MedicalCamp', medicalCampSchema);
