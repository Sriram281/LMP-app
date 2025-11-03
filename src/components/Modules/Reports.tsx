import { useEffect, useState } from 'react';
import { BarChart3, Filter, Download } from 'lucide-react';
import { supabase, Course, Category } from '../../lib/supabase';

interface CourseReport {
  course_id: string;
  course_title: string;
  category_name: string;
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
}

export default function Reports() {
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category_id: '',
    course_id: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateReports();
  }, [filters]);

  const loadData = async () => {
    try {
      const [categoriesRes, coursesRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('courses').select('*'),
      ]);

      setCategories(categoriesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('enrollments')
        .select(`
          course_id,
          completed,
          enrolled_at,
          course:courses!enrollments_course_id_fkey(
            id,
            title,
            category:categories(name)
          )
        `);

      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }

      if (filters.date_from) {
        query = query.gte('enrolled_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('enrolled_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      const reportMap = new Map<string, CourseReport>();

      data?.forEach((enrollment: any) => {
        const courseId = enrollment.course_id;
        const courseTitle = enrollment.course?.title || 'Unknown';
        const categoryName = enrollment.course?.category?.name || 'N/A';

        if (!reportMap.has(courseId)) {
          reportMap.set(courseId, {
            course_id: courseId,
            course_title: courseTitle,
            category_name: categoryName,
            total_enrollments: 0,
            completed_enrollments: 0,
            completion_rate: 0,
          });
        }

        const report = reportMap.get(courseId)!;
        report.total_enrollments++;
        if (enrollment.completed) {
          report.completed_enrollments++;
        }
      });

      const reportsArray = Array.from(reportMap.values()).map(report => ({
        ...report,
        completion_rate: report.total_enrollments > 0
          ? Math.round((report.completed_enrollments / report.total_enrollments) * 100)
          : 0,
      }));

      let filteredReports = reportsArray;

      if (filters.category_id) {
        const coursesInCategory = courses.filter(c => c.category_id === filters.category_id).map(c => c.id);
        filteredReports = reportsArray.filter(r => coursesInCategory.includes(r.course_id));
      }

      setReports(filteredReports);
    } catch (error) {
      console.error('Error generating reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Course Title', 'Category', 'Total Enrollments', 'Completed', 'Completion Rate'];
    const rows = reports.map(r => [
      r.course_title,
      r.category_name,
      r.total_enrollments.toString(),
      r.completed_enrollments.toString(),
      `${r.completion_rate}%`,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course
            </label>
            <select
              value={filters.course_id}
              onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Course Enrollment Reports</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.course_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white">
                      {report.course_title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {report.category_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {report.total_enrollments}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {report.completed_enrollments}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${report.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {report.completion_rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reports.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No reports available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
