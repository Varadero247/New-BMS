import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  HardHat,
  Leaf,
  Award,
  Camera,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { api } from '../lib/api';

interface ReportIncidentProps {
  standard: 'ISO_45001' | 'ISO_14001' | 'ISO_9001';
}

const standardConfig = {
  ISO_45001: {
    title: 'Report H&S Incident',
    subtitle: 'Health & Safety',
    icon: HardHat,
    color: 'red',
    bgGradient: 'from-red-500 to-red-600',
    types: [
      { value: 'INJURY', label: 'Injury' },
      { value: 'NEAR_MISS', label: 'Near Miss' },
      { value: 'UNSAFE_CONDITION', label: 'Unsafe Condition' },
      { value: 'UNSAFE_ACT', label: 'Unsafe Act' },
      { value: 'FIRST_AID', label: 'First Aid' },
      { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
    ],
  },
  ISO_14001: {
    title: 'Report Environmental Event',
    subtitle: 'Environment',
    icon: Leaf,
    color: 'green',
    bgGradient: 'from-green-500 to-emerald-600',
    types: [
      { value: 'SPILL', label: 'Spill' },
      { value: 'EMISSION', label: 'Emission' },
      { value: 'WASTE_ISSUE', label: 'Waste Issue' },
      { value: 'NOISE_COMPLAINT', label: 'Noise Complaint' },
      { value: 'WATER_CONTAMINATION', label: 'Water Contamination' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  ISO_9001: {
    title: 'Report Non-Conformance',
    subtitle: 'Quality',
    icon: Award,
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    types: [
      { value: 'PRODUCT_DEFECT', label: 'Product Defect' },
      { value: 'PROCESS_DEVIATION', label: 'Process Deviation' },
      { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
      { value: 'AUDIT_FINDING', label: 'Audit Finding' },
      { value: 'SUPPLIER_ISSUE', label: 'Supplier Issue' },
      { value: 'DOCUMENTATION', label: 'Documentation' },
    ],
  },
};

const severities = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function ReportIncidentScreen({ standard }: ReportIncidentProps) {
  const navigate = useNavigate();
  const config = standardConfig[standard];
  const Icon = config.icon;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    severity: 'MODERATE',
    location: '',
    dateOccurred: new Date().toISOString().split('T')[0],
    timeOccurred: new Date().toTimeString().slice(0, 5),
    immediateActions: '',
  });

  async function handleSubmit() {
    if (!formData.title || !formData.type) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/incidents', {
        ...formData,
        standard,
        dateOccurred: new Date(`${formData.dateOccurred}T${formData.timeOccurred}`).toISOString(),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className={`w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <CheckCircle className={`w-8 h-8 text-${config.color}-500`} />
          </div>
          <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
          <p className="text-gray-500">Your report has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-top">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.bgGradient} text-white px-4 pt-4 pb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span className="font-bold">{config.title}</span>
          </div>
        </div>
        <p className="text-white/80 text-sm">{config.subtitle} - ISO {standard.split('_')[1]}</p>
      </div>

      {/* Form */}
      <div className="px-4 py-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief description of the incident"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {config.types.map((type) => (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${
                  formData.type === type.value
                    ? `bg-${config.color}-50 border-${config.color}-500 text-${config.color}-700`
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <div className="grid grid-cols-4 gap-2">
            {severities.map((sev) => (
              <button
                key={sev.value}
                onClick={() => setFormData({ ...formData, severity: sev.value })}
                className={`px-3 py-2 border rounded-xl text-xs font-medium transition-colors ${
                  formData.severity === sev.value ? sev.color : 'border-gray-300 text-gray-500'
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.dateOccurred}
              onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={formData.timeOccurred}
              onChange={(e) => setFormData({ ...formData, timeOccurred: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Where did this occur?"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide details about what happened..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
          />
        </div>

        {/* Immediate Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Immediate Actions Taken
          </label>
          <textarea
            value={formData.immediateActions}
            onChange={(e) => setFormData({ ...formData, immediateActions: e.target.value })}
            placeholder="What actions were taken immediately?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
          />
        </div>

        {/* Photo Upload Placeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Camera className="w-4 h-4 inline mr-1" />
            Photos
          </label>
          <button className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 flex flex-col items-center gap-2">
            <Camera className="w-8 h-8" />
            <span className="text-sm">Tap to add photos</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title || !formData.type}
          className={`w-full py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 ${
            loading || !formData.title || !formData.type
              ? 'bg-gray-400'
              : `bg-gradient-to-r ${config.bgGradient}`
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
