import mongoose from 'mongoose';

const homeStatusSchema = new mongoose.Schema(
  {
    home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true, unique: true },

    // ── Ration & Food ─────────────────────────────────────────────────────────
    rationStatus: {
      type: String,
      enum: ['adequate', 'may_become_insufficient', 'insufficient', 'not_available'],
      default: 'adequate',
    },
    foodService: {
      type: String,
      enum: ['regular', 'reduced_quantity', 'some_meals_skipped', 'disrupted'],
      default: 'regular',
    },
    rationIssueReason: {
      type: String,
      enum: [
        'government_supply_delayed', 'quantity_less_than_required',
        'insufficient_funds', 'vendor_issue',
        'emergency_increase_in_residents', 'other', 'none',
      ],
      default: 'none',
    },
    immediateSupport: {
      type: [String],
      enum: ['rice', 'vegetables', 'pulses', 'cooking_oil', 'milk', 'eggs', 'drinking_water', 'none'],
      default: ['none'],
    },

    // ── Pension ───────────────────────────────────────────────────────────────
    pensionStatus: {
      type: String,
      enum: ['all_receiving', 'some_not_receiving', 'no_eligible'],
      default: 'all_receiving',
    },
    pensionNotReceivingCount: {
      type: String,
      enum: ['0', '1_to_5', '6_to_10', 'more_than_10'],
      default: '0',
    },
    pensionNonReceiptReason: {
      type: String,
      enum: [
        'application_pending', 'aadhaar_not_linked', 'bank_account_issue',
        'verification_pending', 'documentation_incomplete',
        'technical_payment_failure', 'other', 'none',
      ],
      default: 'none',
    },
    pensionFollowUp: {
      type: String,
      enum: ['completed', 'in_progress', 'not_initiated'],
      default: 'completed',
    },

    // ── Medical & Care ────────────────────────────────────────────────────────
    medicalStatus: {
      type: String,
      enum: ['fully_available', 'partially_available', 'not_available'],
      default: 'fully_available',
    },
    medicineAvailability: {
      type: String,
      enum: ['sufficient', 'limited_stock', 'critical_shortage'],
      default: 'sufficient',
    },
    urgentMedicalAttention: { type: Boolean, default: false },

    // ── Staff ─────────────────────────────────────────────────────────────────
    staffSituation: {
      type: String,
      enum: ['sufficient', 'minor_shortage', 'significant_shortage', 'critical_shortage'],
      default: 'sufficient',
    },
    staffCareAffected: {
      type: String,
      enum: ['no', 'slightly', 'moderately', 'severely'],
      default: 'no',
    },

    // ── Essential Services ────────────────────────────────────────────────────
    drinkingWater: {
      type: String,
      enum: ['fully_available', 'limited_supply', 'not_available'],
      default: 'fully_available',
    },
    electricity: {
      type: String,
      enum: ['normal', 'frequent_interruptions', 'major_disruption'],
      default: 'normal',
    },
    sanitation: {
      type: String,
      enum: ['fully_functional', 'some_units_under_repair', 'major_issue'],
      default: 'fully_functional',
    },

    // ── Active Issues ─────────────────────────────────────────────────────────
    activeIssues: {
      type: [String],
      enum: [
        'food_shortage', 'pension_delay', 'medical_shortage',
        'staff_shortage', 'water_issue', 'electricity_issue',
        'sanitation_issue', 'financial_grant_delay',
        'safety_security_concern', 'none',
      ],
      default: ['none'],
    },

    // ── Overall Assessment ────────────────────────────────────────────────────
    overallStatus: {
      type: String,
      enum: ['good', 'needs_attention', 'at_risk', 'critical'],
      default: 'good',
    },
    departmentSupport: { type: String, default: '' },
    managerRemarks: { type: String, default: '' },

    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedByName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('HomeStatus', homeStatusSchema);
