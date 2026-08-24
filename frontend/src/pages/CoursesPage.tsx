import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Course, CourseRequest } from '../types/lead';
import { User } from '../types/api';
import { BookOpen, Plus, Search, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';

interface CoursesPageProps {
  currentUser?: User | null;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ currentUser }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<CourseRequest>({
    name: '',
    code: '',
    description: '',
    duration: '1 Year',
    fee: 50000,
    active: true,
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCourses(true);
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      await apiService.createCourse(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        duration: '1 Year',
        fee: 50000,
        active: true,
      });
      await fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  );

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Courses Catalog & Batches
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your coaching institute's academic programs, batches, and tuition structures.
          </p>
        </div>
        
        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Course Creation is restricted to Institute Admins</span>
          </div>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by program name or batch code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Table */}
      <div className="glass-panel border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading courses catalog...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No courses found. {isAdmin ? 'Click "Add New Course" to register batch programs.' : ''}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Course / Batch Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Tuition Fee (INR)</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">
                      <div>{course.name}</div>
                      {course.description && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{course.code || '—'}</td>
                    <td className="px-6 py-4">{course.duration || '—'}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">
                      {course.fee !== undefined ? `₹${course.fee.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {course.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Active Batch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100">Create New Course / Batch</h2>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEET Repeater Fastrack Batch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. NEET-REP-26"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Year / 2 Years"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tuition Fee (₹ INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 110000"
                  value={formData.fee || ''}
                  onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Description / Curriculum</label>
                <textarea
                  rows={3}
                  placeholder="Target students, syllabus coverage, batch timings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-900/30"
                >
                  {saving ? 'Creating...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
