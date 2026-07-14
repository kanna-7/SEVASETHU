import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorEmail: String,
    donorPhone: String,
    amount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ['general', 'meals', 'medical_camp', 'education', 'medicines', 'items', 'other'],
      default: 'general',
    },
    purposeDetails: String,
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
    paymentId: String,
    paymentMethod: { type: String, enum: ['upi', 'qr', 'bank_transfer', 'cash', 'razorpay'], default: 'upi' },
    screenshot: String,
    receipt: String,
    certificate: String,
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    utilization: [{
      description: String,
      amount: Number,
      bills: [String],
      invoices: [String],
      photos: [String],
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
    }],
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

export default mongoose.model('Donation', donationSchema);
