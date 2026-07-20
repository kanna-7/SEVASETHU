import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ShieldCheck, UtensilsCrossed, Banknote, Stethoscope,
  Users, Droplets, Zap, AlertTriangle, CheckCircle2,
  Clock, Save, RefreshCw, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getMyHomeStatus, upsertHomeStatus } from '../../services/api';

// ── Option configs ────────────────────────────────────────────────────────────

const OVERALL_STATUS = [
  { value: 'good', label: 'Good – all essential services functioning normally', color: 'green' },
  { value: 'needs_attention', label: 'Needs Attention – some issues require departmental support', color: 'yellow' },
  { value: 'at_risk', label: 'At Risk – resident welfare may be affected soon', color: 'orange' },
  { value: 'critical', label: 'Critical – immediate intervention required', color: 'red' },
];

const STATUS_BADGE = {
  good: 'bg-green-100 text-green-800 border-green-200',
  needs_attention: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const SECTIONS = [
  {
    id: 'ration',
    icon: UtensilsCrossed,
    label: 'Ration & Food',
    emoji: '🍚',
    color: 'green',
  },
  {
    id: 'pension',
    icon: Banknote,
    label: 'Pension Status',
    emoji: '💰',
    color: 'blue',
  },
  {
    id: 'medical',
    icon: Stethoscope,
    label: 'Medical & Care',
    emoji: '🏥',
    color: 'teal',
  },
  {
    id: 'staff',
    icon: Users,
    label: 'Staff & Care',
    emoji: '👥',
    color: 'purple',
  },
  {
    id: 'services',
    icon: Droplets,
    label: 'Essential Services',
    emoji: '🏢',
    color: 'sky',
  },
  {
    id: 'issues',
    icon: AlertTriangle,
    label: 'Active Issues',
    emoji: '🚨',
    color: 'red',
  },
  {
    id: 'overall',
    icon: ShieldCheck,
    label: 'Overall Assessment',
    emoji: '📊',
    color: 'indigo',
  },
];

const DEFAULT_FORM = {
  rationStatus: 'adequate',
  foodService: 'regular',
  rationIssueReason: 'none',
  immediateSupport: ['none'],
  pensionStatus: 'all_receiving',
  pensionNotReceivingCount: '0',
  pensionNonReceiptReason: 'none',
  pensionFollowUp: 'completed',
  medicalStatus: 'fully_available',
  medicineAvailability: 'sufficient',
  urgentMedicalAttention: false,
  staffSituation: 'sufficient',
  staffCareAffected: 'no',
  drinkingWater: 'fully_available',
  electricity: 'normal',
  sanitation: 'fully_functional',
  activeIssues: ['none'],
  overallStatus: 'good',
  departmentSupport: '',
  managerRemarks: '',
};

function RadioGroup({ name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            value === opt.value
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 text-primary-600"
          />
          <span className="text-sm text-gray-700 leading-snug">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ name, values, onChange, options }) {
  const toggle = (val) => {
    let next;
    if (val === 'none') {
      next = ['none'];
    } else {
      const without = values.filter((v) => v !== 'none');
      next = without.includes(val)
        ? without.filter((v) => v !== val)
        : [...without, val];
      if (next.length === 0) next = ['none'];
    }
    onChange(next);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            values.includes(opt.value)
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="mt-0.5 text-primary-600 rounded"
          />
          <span className="text-sm text-gray-700 leading-snug">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function SectionCard({ section, open, onToggle, children }) {
  const Icon = section.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-${section.color}-100 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${section.color}-600`} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              <span>{section.emoji}</span> {section.label}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5 space-y-6">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

export default function ManagerStatusUpdatePage() {
  const { isManager, loading: authLoading } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [openSections, setOpenSections] = useState({ ration: true, pension: true, medical: true, staff: false, services: false, issues: false, overall: true });

  useEffect(() => {
    if (isManager) {
      getMyHomeStatus()
        .then((res) => {
          if (res.data.data) {
            const d = res.data.data;
            setForm({
              rationStatus: d.rationStatus || 'adequate',
              foodService: d.foodService || 'regular',
              rationIssueReason: d.rationIssueReason || 'none',
              immediateSupport: d.immediateSupport || ['none'],
              pensionStatus: d.pensionStatus || 'all_receiving',
              pensionNotReceivingCount: d.pensionNotReceivingCount || '0',
              pensionNonReceiptReason: d.pensionNonReceiptReason || 'none',
              pensionFollowUp: d.pensionFollowUp || 'completed',
              medicalStatus: d.medicalStatus || 'fully_available',
              medicineAvailability: d.medicineAvailability || 'sufficient',
              urgentMedicalAttention: d.urgentMedicalAttention || false,
              staffSituation: d.staffSituation || 'sufficient',
              staffCareAffected: d.staffCareAffected || 'no',
              drinkingWater: d.drinkingWater || 'fully_available',
              electricity: d.electricity || 'normal',
              sanitation: d.sanitation || 'fully_functional',
              activeIssues: d.activeIssues || ['none'],
              overallStatus: d.overallStatus || 'good',
              departmentSupport: d.departmentSupport || '',
              managerRemarks: d.managerRemarks || '',
            });
            if (d.updatedAt) setSavedAt(new Date(d.updatedAt));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isManager]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleSection = (id) => setOpenSections((s) => ({ ...s, [id]: !s[id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        immediateSupport: JSON.stringify(form.immediateSupport),
        activeIssues: JSON.stringify(form.activeIssues),
      };
      await upsertHomeStatus(payload);
      setSavedAt(new Date());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save status');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!isManager) return <Navigate to="/login" />;

  const activeIssueCount = form.activeIssues.filter((i) => i !== 'none').length;
  const overallCfg = OVERALL_STATUS.find((o) => o.value === form.overallStatus);

  return (
    <DashboardLayout type="manager">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-primary-600" />
              Home Status Update
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              This status is shown publicly on your home's About page and to the department admin
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {savedAt && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last saved: {savedAt.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${STATUS_BADGE[form.overallStatus]}`}>
              {overallCfg?.label.split('–')[0].trim()}
            </span>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Fill in the current operational status of your home. This helps the department understand what is working and what requires support. Update this weekly or whenever there is a change.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-gray-200 h-20 animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── RATION & FOOD ──────────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[0]} open={openSections.ration} onToggle={() => toggleSection('ration')}>
              <Field label="Current Ration Status">
                <RadioGroup name="rationStatus" value={form.rationStatus} onChange={(v) => set('rationStatus', v)} options={[
                  { value: 'adequate', label: 'Adequate for all residents' },
                  { value: 'may_become_insufficient', label: 'Available but may become insufficient' },
                  { value: 'insufficient', label: 'Insufficient for current residents' },
                  { value: 'not_available', label: 'Not available' },
                ]} />
              </Field>

              <Field label="Food Service Status">
                <RadioGroup name="foodService" value={form.foodService} onChange={(v) => set('foodService', v)} options={[
                  { value: 'regular', label: 'All meals served regularly' },
                  { value: 'reduced_quantity', label: 'Meals served with reduced quantity' },
                  { value: 'some_meals_skipped', label: 'Some meals skipped' },
                  { value: 'disrupted', label: 'Food service disrupted' },
                ]} />
              </Field>

              {form.rationStatus !== 'adequate' && (
                <Field label="Main reason for inadequacy">
                  <RadioGroup name="rationIssueReason" value={form.rationIssueReason} onChange={(v) => set('rationIssueReason', v)} options={[
                    { value: 'government_supply_delayed', label: 'Government supply delayed' },
                    { value: 'quantity_less_than_required', label: 'Quantity received is less than required' },
                    { value: 'insufficient_funds', label: 'Funds not sufficient' },
                    { value: 'vendor_issue', label: 'Vendor/supplier issue' },
                    { value: 'emergency_increase_in_residents', label: 'Emergency increase in residents' },
                    { value: 'other', label: 'Other' },
                  ]} />
                </Field>
              )}

              <Field label="Immediate support required" hint="Select all that apply">
                <CheckboxGroup values={form.immediateSupport} onChange={(v) => set('immediateSupport', v)} options={[
                  { value: 'rice', label: 'Rice' },
                  { value: 'vegetables', label: 'Vegetables' },
                  { value: 'pulses', label: 'Pulses' },
                  { value: 'cooking_oil', label: 'Cooking Oil' },
                  { value: 'milk', label: 'Milk' },
                  { value: 'eggs', label: 'Eggs' },
                  { value: 'drinking_water', label: 'Drinking Water' },
                  { value: 'none', label: 'No immediate support required' },
                ]} />
              </Field>
            </SectionCard>

            {/* ── PENSION ────────────────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[1]} open={openSections.pension} onToggle={() => toggleSection('pension')}>
              <Field label="Are all eligible residents currently receiving pension?">
                <RadioGroup name="pensionStatus" value={form.pensionStatus} onChange={(v) => set('pensionStatus', v)} options={[
                  { value: 'all_receiving', label: 'Yes, all eligible residents are receiving' },
                  { value: 'some_not_receiving', label: 'No, some eligible residents are not receiving' },
                  { value: 'no_eligible', label: 'No eligible residents in the home' },
                ]} />
              </Field>

              {form.pensionStatus === 'some_not_receiving' && (<>
                <Field label="Number of eligible residents NOT receiving pension">
                  <RadioGroup name="pensionNotReceivingCount" value={form.pensionNotReceivingCount} onChange={(v) => set('pensionNotReceivingCount', v)} options={[
                    { value: '0', label: '0' },
                    { value: '1_to_5', label: '1 – 5' },
                    { value: '6_to_10', label: '6 – 10' },
                    { value: 'more_than_10', label: 'More than 10' },
                  ]} />
                </Field>

                <Field label="Main reason for non-receipt">
                  <RadioGroup name="pensionNonReceiptReason" value={form.pensionNonReceiptReason} onChange={(v) => set('pensionNonReceiptReason', v)} options={[
                    { value: 'application_pending', label: 'Pension application pending' },
                    { value: 'aadhaar_not_linked', label: 'Aadhaar not linked' },
                    { value: 'bank_account_issue', label: 'Bank account issue' },
                    { value: 'verification_pending', label: 'Verification pending at department' },
                    { value: 'documentation_incomplete', label: 'Documentation incomplete' },
                    { value: 'technical_payment_failure', label: 'Technical / payment failure' },
                    { value: 'other', label: 'Other' },
                  ]} />
                </Field>

                <Field label="Has home management taken follow-up action?">
                  <RadioGroup name="pensionFollowUp" value={form.pensionFollowUp} onChange={(v) => set('pensionFollowUp', v)} options={[
                    { value: 'completed', label: 'Yes, follow-up completed' },
                    { value: 'in_progress', label: 'Yes, follow-up in progress' },
                    { value: 'not_initiated', label: 'No, action not yet initiated' },
                  ]} />
                </Field>
              </>)}
            </SectionCard>

            {/* ── MEDICAL ────────────────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[2]} open={openSections.medical} onToggle={() => toggleSection('medical')}>
              <Field label="Current Medical Support Status">
                <RadioGroup name="medicalStatus" value={form.medicalStatus} onChange={(v) => set('medicalStatus', v)} options={[
                  { value: 'fully_available', label: 'Fully available' },
                  { value: 'partially_available', label: 'Partially available' },
                  { value: 'not_available', label: 'Not available' },
                ]} />
              </Field>

              <Field label="Medicine Availability">
                <RadioGroup name="medicineAvailability" value={form.medicineAvailability} onChange={(v) => set('medicineAvailability', v)} options={[
                  { value: 'sufficient', label: 'Sufficient' },
                  { value: 'limited_stock', label: 'Limited stock' },
                  { value: 'critical_shortage', label: 'Critical shortage' },
                ]} />
              </Field>

              <Field label="Any resident requiring urgent medical attention?">
                <RadioGroup name="urgentMedicalAttention" value={String(form.urgentMedicalAttention)} onChange={(v) => set('urgentMedicalAttention', v === 'true')} options={[
                  { value: 'false', label: 'No' },
                  { value: 'true', label: 'Yes' },
                ]} />
              </Field>
            </SectionCard>

            {/* ── STAFF ──────────────────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[3]} open={openSections.staff} onToggle={() => toggleSection('staff')}>
              <Field label="Current Staff Situation">
                <RadioGroup name="staffSituation" value={form.staffSituation} onChange={(v) => set('staffSituation', v)} options={[
                  { value: 'sufficient', label: 'Sufficient for all shifts' },
                  { value: 'minor_shortage', label: 'Minor shortage' },
                  { value: 'significant_shortage', label: 'Significant shortage' },
                  { value: 'critical_shortage', label: 'Critical shortage affecting care' },
                ]} />
              </Field>

              <Field label="Is resident care being affected by staff shortage?">
                <RadioGroup name="staffCareAffected" value={form.staffCareAffected} onChange={(v) => set('staffCareAffected', v)} options={[
                  { value: 'no', label: 'No' },
                  { value: 'slightly', label: 'Slightly' },
                  { value: 'moderately', label: 'Moderately' },
                  { value: 'severely', label: 'Severely' },
                ]} />
              </Field>
            </SectionCard>

            {/* ── ESSENTIAL SERVICES ─────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[4]} open={openSections.services} onToggle={() => toggleSection('services')}>
              <Field label="Drinking Water">
                <RadioGroup name="drinkingWater" value={form.drinkingWater} onChange={(v) => set('drinkingWater', v)} options={[
                  { value: 'fully_available', label: 'Fully available' },
                  { value: 'limited_supply', label: 'Limited supply' },
                  { value: 'not_available', label: 'Not available' },
                ]} />
              </Field>

              <Field label="Electricity">
                <RadioGroup name="electricity" value={form.electricity} onChange={(v) => set('electricity', v)} options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'frequent_interruptions', label: 'Frequent interruptions' },
                  { value: 'major_disruption', label: 'Major disruption' },
                ]} />
              </Field>

              <Field label="Toilets & Sanitation">
                <RadioGroup name="sanitation" value={form.sanitation} onChange={(v) => set('sanitation', v)} options={[
                  { value: 'fully_functional', label: 'Fully functional' },
                  { value: 'some_units_under_repair', label: 'Some units under repair' },
                  { value: 'major_issue', label: 'Major sanitation issue' },
                ]} />
              </Field>
            </SectionCard>

            {/* ── ACTIVE ISSUES ──────────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[5]} open={openSections.issues} onToggle={() => toggleSection('issues')}>
              <Field label="Select all active issues" hint="These will appear as open alerts on the public page">
                <CheckboxGroup values={form.activeIssues} onChange={(v) => set('activeIssues', v)} options={[
                  { value: 'food_shortage', label: 'Food shortage' },
                  { value: 'pension_delay', label: 'Pension delay' },
                  { value: 'medical_shortage', label: 'Medical shortage' },
                  { value: 'staff_shortage', label: 'Staff shortage' },
                  { value: 'water_issue', label: 'Water issue' },
                  { value: 'electricity_issue', label: 'Electricity issue' },
                  { value: 'sanitation_issue', label: 'Sanitation issue' },
                  { value: 'financial_grant_delay', label: 'Financial grant delay' },
                  { value: 'safety_security_concern', label: 'Safety / security concern' },
                  { value: 'none', label: 'No active issues' },
                ]} />
              </Field>
            </SectionCard>

            {/* ── OVERALL ASSESSMENT ─────────────────────────────────────────── */}
            <SectionCard section={SECTIONS[6]} open={openSections.overall} onToggle={() => toggleSection('overall')}>
              <Field label="Current Welfare Status of the Home">
                <div className="space-y-2">
                  {OVERALL_STATUS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.overallStatus === opt.value
                          ? `border-${opt.color}-400 bg-${opt.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="overallStatus"
                        value={opt.value}
                        checked={form.overallStatus === opt.value}
                        onChange={() => set('overallStatus', opt.value)}
                        className="mt-0.5"
                      />
                      <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="What support is needed from the department right now?" hint="Short description of immediate requirements">
                <textarea
                  value={form.departmentSupport}
                  onChange={(e) => set('departmentSupport', e.target.value)}
                  rows={3}
                  placeholder="e.g. Requesting immediate pension verification camp and approval for 2 additional caregivers..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </Field>

              <Field label="Manager Remarks (optional)">
                <textarea
                  value={form.managerRemarks}
                  onChange={(e) => set('managerRemarks', e.target.value)}
                  rows={2}
                  placeholder="Any other observations..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </Field>
            </SectionCard>

            {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
            <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="text-sm text-gray-500">
                {activeIssueCount > 0 ? (
                  <span className="text-red-600 font-semibold">⚠ {activeIssueCount} active issue{activeIssueCount > 1 ? 's' : ''} reported</span>
                ) : (
                  <span className="text-green-600 font-semibold">✅ No active issues</span>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors shadow"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Status Update'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
