import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: Number,
    skills: [String],
    availability: String,
    preferredHome: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
    status: { type: String, enum: ['pending', 'approved', 'active', 'inactive'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activities: [{
      event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
      date: Date,
      hours: Number,
      notes: String,
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Volunteer', volunteerSchema);
