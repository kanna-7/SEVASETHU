import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: ['medical_camp', 'food_donation', 'festival', 'birthday', 'government_visit', 'ngo_visit', 'volunteer', 'other'],
      required: true,
    },
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
    date: { type: Date, required: true },
    endDate: Date,
    location: String,
    // Event status tracking
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Images uploaded after event completion
    images: [String],
    completionImages: [String],
    completionNotes: String,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true },
    attendees: Number,
    relatedEntity: {
      type: { type: String, enum: ['medical_camp', 'donation', 'resident'] },
      id: mongoose.Schema.Types.ObjectId,
    },
    // Reference to linked medical camp
    medicalCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalCamp' },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
