import React, { useState, useEffect, useCallback } from 'react';
import { CourseList } from '../components/courses/CourseList';
import { CourseModal } from '../components/courses/CourseModal';
import { Course, CreateCourseRequest, UpdateCourseRequest } from '../types/leads';
import { apiService } from '../services/api';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateOrUpdate = async (data: CreateCourseRequest | UpdateCourseRequest) => {
    if (courseToEdit) {
      const updated = await apiService.updateCourse(courseToEdit.id, data);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const created = await apiService.createCourse(data as CreateCourseRequest);
      setCourses((prev) => [created, ...prev]);
    }
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      const updated = await apiService.updateCourse(course.id, { active: !course.active });
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteCourse(id);
      setCourses((prev) => prev.map((c) => c.id !== id ? c : null).filter(Boolean) as Course[]);
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Course & Program Catalog</h2>
            <p className="text-xs text-slate-400">
              Manage curricula, batch durations, and tuition fees for student enquiries
            </p>
          </div>
        </div>

        <button
          onClick={fetchCourses}
          disabled={isLoading}
          className="self-start sm:self-auto p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          title="Refresh Courses"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Course List */}
      <CourseList
        courses={courses}
        isLoading={isLoading}
        onAddNew={() => {
          setCourseToEdit(null);
          setIsModalOpen(true);
        }}
        onEdit={(course) => {
          setCourseToEdit(course);
          setIsModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal */}
      <CourseModal
        isOpen={isModalOpen}
        courseToEdit={courseToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setCourseToEdit(null);
        }}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
};
