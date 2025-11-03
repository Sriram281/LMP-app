import { useEffect, useState } from 'react';
import { Award, Download, Plus, Search } from 'lucide-react';
import { supabase, Certificate, Course, Profile } from '../../lib/supabase';

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [certificatesRes, coursesRes, usersRes] = await Promise.all([
        supabase.from('certificates').select(`
          *,
          user:profiles!certificates_user_id_fkey(id, full_name, email),
          course:courses!certificates_course_id_fkey(id, title)
        `).order('issued_at', { ascending: false }),
        supabase.from('courses').select('*').eq('is_published', true),
        supabase.from('profiles').select('*'),
      ]);

      setCertificates(certificatesRes.data || []);
      setCourses(coursesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = users.find(u => u.id === formData.user_id);
      const course = courses.find(c => c.id === formData.course_id);

      if (!user || !course) return;

      const certificateUrl = `https://example.com/certificates/${formData.user_id}-${formData.course_id}.pdf`;

      await supabase.from('certificates').insert([{
        user_id: formData.user_id,
        course_id: formData.course_id,
        certificate_url: certificateUrl,
      }]);

      setShowModal(false);
      setFormData({ user_id: '', course_id: '' });
      loadData();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    alert('Certificate download functionality would be implemented here.');
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Certificates</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Generate Certificate
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Issued Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Award size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {certificate.user?.full_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {certificate.user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {certificate.course?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(certificate.issued_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDownload(certificate)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <Award size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No certificates found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Generate Certificate</h3>
            </div>

            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Student</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Course
                </label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ user_id: '', course_id: '' }); }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
