import React, { useState, useEffect } from 'react';
import { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest, 
  LeadPriority, 
  LeadSource, 
  Course, 
  CounselorOption 
} from '../../types/leads';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Flame, 
  Share2, 
  UserCheck, 
  FileText, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  leadToEdit?: Lead | null;
  courses: Course[];
  counselors: CounselorOption[];
  onClose: () => void;
  onSubmit: (data: CreateLeadRequest | UpdateLeadRequest) => Promise<void>;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  leadToEdit,
  courses,
  counselors,
  onClose,
  onSubmit,
}) => {
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [qualification, setQualification] = useState('');
  const [courseId, setCourseId] = useState('');
  const [priority, setPriority] = useState<LeadPriority>('WARM');
  const [source, setSource] = useState<LeadSource>('WEBSITE');
  const [assignedToId, setAssignedToId] = useState('');
  const [initialNote, setInitialNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leadToEdit) {
      setStudentName(leadToEdit.studentName);
      setPhone(leadToEdit.phone);
      setEmail(leadToEdit.email || '');
      setCity(leadToEdit.city || '');
      setQualification(leadToEdit.qualification || '');
      setCourseId(leadToEdit.courseId || '');
      setPriority(leadToEdit.priority);
      setSource(leadToEdit.source);
      setAssignedToId(leadToEdit.assignedToId || '');
      setInitialNote('');
    } else {
      setStudentName('');
      setPhone('');
      setEmail('');
      setCity('');
      setQualification('');
      setCourseId(courses.length > 0 ? courses[0].id : '');
      setPriority('WARM');
      setSource('META_ADS');
      setAssignedToId(counselors.length > 0 ? counselors[0].id : '');
      setInitialNote('');
    }
    setError(null);
  }, [leadToEdit, courses, counselors, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentName.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Student phone / WhatsApp number is required.');
      return;
    }

    // Basic Indian phone validation
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email format.');
      return;
    }

    setLoading(true);
    try {
      if (leadToEdit) {
        await onSubmit({
          studentName: studentName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          qualification: qualification.trim() || undefined,
          courseId: courseId || undefined,
          priority,
          source,
          assignedToId: assignedToId || undefined,
        });
      } else {
        await onSubmit({
          studentName: studentName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city: city.trim() || undefined,
          qualification: qualification.trim() || undefined,
          courseId: courseId || undefined,
          priority,
          source,
          assignedToId: assignedToId || undefined,
          initialNote: initialNote.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {leadToEdit ? 'Edit Student Enquiry' : 'Capture New Student Lead'}
              </h3>
              <p className="text-xs text-slate-400">
                Institute admissions & counselor assignment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Student Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                WhatsApp / Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                City / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Mumbai, Bengaluru"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Qualification & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Educational Qualification
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Tech CS, Class 12, Graduate"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Course / Program
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select target course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - ₹{c.fee.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Priority, Source, Counselor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Lead Priority
              </label>
              <div className="relative">
                <Flame className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="HOT">🔥 Hot (High Intent)</option>
                  <option value="WARM">⚡ Warm (Interested)</option>
                  <option value="COLD">❄️ Cold (Browsing)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Capture Source
              </label>
              <div className="relative">
                <Share2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="META_ADS">Meta / Facebook Ads</option>
                  <option value="GOOGLE_ADS">Google Search Ads</option>
                  <option value="WEBSITE">Institute Website</option>
                  <option value="WALK_IN">Walk-in Desk</option>
                  <option value="REFERRAL">Student Referral</option>
                  <option value="OTHER">Other / Portal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assigned Counselor
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Initial Note (only when creating) */}
          {!leadToEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Initial Counselor Notes / Background
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder="e.g. Student enquired about batch timings and scholarship eligibility..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Lead...</span>
                </>
              ) : (
                <span>{leadToEdit ? 'Update Lead' : 'Save & Capture Lead'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
