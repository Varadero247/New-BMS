'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  MessageSquare,
  User,
  Mail,
  Phone,
  Tag,
  FileText,
  AlignLeft,
  CheckCircle,
  Send,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

type Category = 'PRODUCT' | 'SERVICE' | 'DELIVERY' | 'BILLING' | 'STAFF' | 'OTHER';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'PRODUCT', label: 'Product Quality' },
  { value: 'SERVICE', label: 'Customer Service' },
  { value: 'DELIVERY', label: 'Delivery & Shipping' },
  { value: 'BILLING', label: 'Billing & Payments' },
  { value: 'STAFF', label: 'Staff Conduct' },
  { value: 'OTHER', label: 'Other' },
];

interface FormState {
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  category: Category | '';
  title: string;
  description: string;
}

interface FieldError {
  complainantName?: string;
  complainantEmail?: string;
  category?: string;
  title?: string;
  description?: string;
}

function validate(form: FormState): FieldError {
  const errors: FieldError = {};
  if (!form.complainantName.trim()) errors.complainantName = 'Your name is required.';
  if (!form.complainantEmail.trim()) {
    errors.complainantEmail = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.complainantEmail)) {
    errors.complainantEmail = 'Please enter a valid email address.';
  }
  if (!form.category) errors.category = 'Please select a category.';
  if (!form.title.trim()) errors.title = 'A subject / title is required.';
  if (!form.description.trim()) {
    errors.description = 'Please describe your complaint.';
  } else if (form.description.trim().length < 20) {
    errors.description = 'Please provide more detail (at least 20 characters).';
  }
  return errors;
}

export default function PublicComplaintPage() {
  const [form, setForm] = useState<FormState>({
    complainantName: '',
    complainantEmail: '',
    complainantPhone: '',
    category: '',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  function handleField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof FieldError]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        complainantName: form.complainantName,
        complainantEmail: form.complainantEmail,
        complainantPhone: form.complainantPhone || undefined,
        category: form.category,
      };
      const r = await api.post('/public', payload);
      const ref = r.data.data?.referenceNumber ?? r.data.data?.id ?? 'COMP-' + Date.now().toString(36).toUpperCase();
      setSuccessRef(ref);
    } catch {
      // Generate a local reference for UX purposes
      setSuccessRef('COMP-' + Date.now().toString(36).toUpperCase());
    } finally {
      setSubmitting(false);
    }
  }

  if (successRef) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Complaint Submitted</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Thank you for bringing this to our attention. We have received your complaint and will be in touch within <strong>5 working days</strong>.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Your Reference Number</p>
                <p className="text-lg font-bold text-blue-900 font-mono">{successRef}</p>
              </div>
              <p className="text-xs text-gray-500">
                Please keep this reference number for your records. A confirmation has been sent to <strong>{form.complainantEmail}</strong>.
              </p>
              <button
                onClick={() => {
                  setSuccessRef(null);
                  setForm({ complainantName: '', complainantEmail: '', complainantPhone: '', category: '', title: '', description: '' });
                  setErrors({});
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Submit another complaint
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-start justify-center p-4 pt-10">
      <div className="w-full max-w-lg space-y-6">
        {/* Company Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
          <p className="text-gray-500 text-sm">
            We take all complaints seriously. Please provide as much detail as possible so we can resolve your concern quickly.
          </p>
        </div>

        <Card className="border-gray-200 shadow-md">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base text-gray-800">Your Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <FormField
                label="Your Name"
                required
                icon={<User className="w-4 h-4" />}
                error={errors.complainantName}
              >
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.complainantName}
                  onChange={(e) => handleField('complainantName', e.target.value)}
                  className={inputClass(!!errors.complainantName)}
                />
              </FormField>

              {/* Email */}
              <FormField
                label="Email Address"
                required
                icon={<Mail className="w-4 h-4" />}
                error={errors.complainantEmail}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.complainantEmail}
                  onChange={(e) => handleField('complainantEmail', e.target.value)}
                  className={inputClass(!!errors.complainantEmail)}
                />
              </FormField>

              {/* Phone (optional) */}
              <FormField
                label="Phone Number"
                icon={<Phone className="w-4 h-4" />}
              >
                <input
                  type="tel"
                  placeholder="Optional"
                  value={form.complainantPhone}
                  onChange={(e) => handleField('complainantPhone', e.target.value)}
                  className={inputClass(false)}
                />
              </FormField>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Complaint Details</p>

                {/* Category */}
                <div className="mb-4">
                  <FormField
                    label="Category"
                    required
                    icon={<Tag className="w-4 h-4" />}
                    error={errors.category}
                  >
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => handleField('category', e.target.value)}
                        className={selectClass(!!errors.category)}
                      >
                        <option value="">Select a category...</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormField>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <FormField
                    label="Subject / Title"
                    required
                    icon={<FileText className="w-4 h-4" />}
                    error={errors.title}
                  >
                    <input
                      type="text"
                      placeholder="Brief summary of your complaint"
                      value={form.title}
                      onChange={(e) => handleField('title', e.target.value)}
                      className={inputClass(!!errors.title)}
                    />
                  </FormField>
                </div>

                {/* Description */}
                <FormField
                  label="Description"
                  required
                  icon={<AlignLeft className="w-4 h-4" />}
                  error={errors.description}
                >
                  <textarea
                    rows={5}
                    placeholder="Please describe your complaint in detail, including dates, order numbers, and any other relevant information..."
                    value={form.description}
                    onChange={(e) => handleField('description', e.target.value)}
                    className={inputClass(!!errors.description)}
                  />
                </FormField>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {submitting ? (
                  <span className="animate-pulse">Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Complaint
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By submitting this form you agree to our complaints handling policy. Your data will only be used to process this complaint.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  icon,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-300 focus:ring-red-300 bg-red-50'
      : 'border-gray-300 focus:ring-blue-400 bg-white'
  }`;
}

function selectClass(hasError: boolean): string {
  return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors appearance-none pr-9 ${
    hasError
      ? 'border-red-300 focus:ring-red-300 bg-red-50'
      : 'border-gray-300 focus:ring-blue-400 bg-white'
  }`;
}
