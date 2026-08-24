import React, { useState } from 'react';
import { Course } from '../../types/leads';
import { useAuth } from '../../hooks/useAuth';
import { 
  BookOpen, 
  Clock, 
  IndianRupee, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search,
  Plus
} from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  isLoading: boolean;
  onEdit: (course: Course) => void;
  onToggleStatus: (course: Course) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  onAddNew,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses by name or code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {isAdmin && (
          <button
            onClick={onAddNew}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-900/30 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 border border-slate-800 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-card rounded-xl p-12 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No courses found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm 
              ? 'No courses matched your search query. Try resetting your search terms.' 
              : 'Add your institute courses, duration, and fee structure to begin capturing enquiries.'}
          </p>
          {isAdmin && !searchTerm && (
            <button
              onClick={onAddNew}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Course</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/40 text-[11px] font-mono font-semibold">
                    {course.code}
                  </span>

                  <span className={`inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    course.active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {course.active ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Admissions Open</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-blue-300 transition-colors leading-snug">
                    {course.name}
                  </h3>
                  {course.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Metrics & Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{course.duration}</span>
                  </div>

                  <div className="flex items-center space-x-1 font-mono font-bold text-slate-100">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{course.fee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Admin Management Buttons */}
                {isAdmin && (
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => onToggleStatus(course)}
                      className={`text-[11px] px-2 py-1 rounded transition-colors ${
                        course.active 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                      }`}
                      title={course.active ? 'Deactivate course' : 'Activate course'}
                    >
                      {course.active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => onEdit(course)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 rounded transition-colors"
                      title="Edit course details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${course.name}?`)) {
                          onDelete(course.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
