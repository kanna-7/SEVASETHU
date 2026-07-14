import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
    type: {
      type: String,
      enum: [
        'new_donation', 'low_stock', 'medical_camp', 'pension_approved',
        'resident_added', 'government_scheme', 'volunteer_visit',
        'home_approved', 'home_rejected', 'event_reminder', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
    channels: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
