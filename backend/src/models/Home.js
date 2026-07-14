import mongoose from 'mongoose';
import { HOME_TYPES, HOME_STATUS, CONDITION_STATUS } from '../config/roles.js';

const homeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: HOME_TYPES, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      lat: Number,
      lng: Number,
    },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    residentCount: { type: Number, default: 0 },
    capacity: { type: Number },
    images: {
      building: [String],
      kitchen: [String],
      rooms: [String],
      residents: [String],
      gallery: [String],
    },
    documents: {
      registrationCertificate: String,
      ngoCertificate: String,
      pan: String,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    qrCode: { type: String },
    currentNeeds: [{ item: String, quantity: Number, priority: String }],
    monthlyExpenses: [{
      month: String,
      year: Number,
      amount: Number,
      breakdown: [{ category: String, amount: Number }],
    }],
    conditionStatus: {
      type: String,
      enum: CONDITION_STATUS,
      default: 'good',
    },
    status: {
      type: String,
      enum: HOME_STATUS,
      default: 'pending',
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactPerson: {
      name: String,
      phone: String,
      email: String,
      designation: String,
    },
    reviews: [{
      donorName: String,
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

homeSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Home', homeSchema);
