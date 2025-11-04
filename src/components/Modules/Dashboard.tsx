import { useEffect, useState } from 'react';
import { Users, BookOpen, FolderOpen, Award, TrendingUp } from 'lucide-react';
import { supabase, Course } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalCategories: number;
  totalDomains: number;
  totalExperts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalCategories: 0,
    totalDomains: 0,
    totalExperts: 0,
  });
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, coursesRes, categoriesRes, domainsRes, expertsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('domains').select('id', { count: 'exact', head: true }),
        supabase.from('experts').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalCategories: categoriesRes.count || 0,
        totalDomains: domainsRes.count || 0,
        totalExperts: expertsRes.count || 0,
      });

      const { data: coursesWithEnrollments } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(full_name),
          category:categories(name),
          enrollments(id)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (coursesWithEnrollments) {
        const coursesWithCount = coursesWithEnrollments.map(course => ({
          ...course,
          enrollments_count: course.enrollments?.length || 0,
        }));

        const sortedByEnrollments = [...coursesWithCount].sort(
          (a, b) => b.enrollments_count - a.enrollments_count
        );

        setPopularCourses(sortedByEnrollments.slice(0, 6));
        setRecentCourses(coursesWithCount.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'from-green-500 to-green-600' },
    { label: 'Total Categories', value: stats.totalCategories, icon: FolderOpen, color: 'from-orange-500 to-orange-600' },
    { label: 'Available Domains', value: stats.totalDomains, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Experts', value: stats.totalExperts, icon: Award, color: 'from-pink-500 to-pink-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Most Popular Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCourses.map((course:any) => (
            <div
              key={course.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-3 flex items-center justify-center">
                <BookOpen size={40} className="text-white opacity-50" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {course.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Category: {course.category?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Instructor: {course.instructor?.full_name || 'N/A'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {course.enrollments_count} enrolled
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Newly Added Courses</h3>
        <div className="space-y-3">
          {recentCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{course.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By {course.instructor?.full_name || 'N/A'} • {course.enrollments_count} students
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
