import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, Search } from "lucide-react";
import { supabase, Course, Expert } from "../../lib/supabase";

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor_id: "",
    category: "",
    domain: "",
    subcategory: "",
    course_level: "",
    language: "",
    course_duration: "",
    is_published: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, expertsRes] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("experts").select("*"),
      ]);

      if (coursesRes.error) {
        console.error("Error loading courses:", coursesRes.error);
      }

      if (expertsRes.error) {
        console.error("Error loading experts:", expertsRes.error);
      }

      setCourses(coursesRes.data || []);
      setExperts(expertsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        instructor_id: formData.instructor_id,
        category: formData.category,
        domain: formData.domain,
        subcategory: formData.subcategory,
        course_level: formData.course_level,
        language: formData.language,
        course_duration: formData.course_duration,
        is_published: formData.is_published,
      };

      console.log("courseData : ", courseData);

      if (editingCourse) {
        const updateData = {
          ...courseData,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from("courses")
          .update(updateData)
          .eq("id", editingCourse.id);
      } else {
        await supabase.from("courses").insert([courseData]);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      instructor_id: course.instructor_id || "",
      category: course.category || "",
      domain: course.domain || "",
      subcategory: course.subcategory || "",
      course_level: course.course_level || "",
      language: course.language || "",
      course_duration: course.course_duration || "",
      is_published: course.is_published,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await supabase.from("courses").delete().eq("id", id);
      loadData();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      instructor_id: "",
      category: "",
      domain: "",
      subcategory: "",
      course_level: "",
      language: "",
      course_duration: "",
      is_published: false,
    });
  };

  const testDatabaseConnection = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*");

      if (coursesError) {
        console.error("Error reading courses:", coursesError);
        alert(`Error reading courses: ${coursesError.message}`);
        return;
      }

      console.log("Courses data:", coursesData);
      alert(
        `Database connection successful. Found ${
          coursesData?.length || 0
        } courses.`
      );
    } catch (error) {
      console.error("Error testing database connection:", error);
      alert(`Error testing database connection: ${error}`);
    }
  };

  const addLatestProgrammingCourse = async () => {
    try {
      const latestCourses = [
        // 🌐 WEB DEVELOPMENT (General)
        {
          title: "Complete Web Development Bootcamp",
          description:
            "Learn full-stack development from basics to deployment with hands-on projects.",
          category: "Web Development",
          domain: "Full Stack",
          subcategory: "Web Fundamentals",
          course_level: "Beginner",
          language: "English",
          course_duration: "20 hours",
          is_published: true,
        },
        {
          title: "HTML5 & CSS3 Fundamentals",
          description:
            "Master the building blocks of modern websites using semantic HTML and responsive CSS.",
          category: "Web Development",
          domain: "Frontend",
          subcategory: "HTML & CSS",
          course_level: "Beginner",
          language: "English",
          course_duration: "10 hours",
          is_published: true,
        },
        {
          title: "JavaScript Essentials",
          description:
            "Understand JavaScript concepts, DOM manipulation, ES6+ features, and event handling.",
          category: "Web Development",
          domain: "Frontend",
          subcategory: "JavaScript",
          course_level: "Beginner",
          language: "English",
          course_duration: "12 hours",
          is_published: true,
        },
        {
          title: "Version Control with Git & GitHub",
          description:
            "Learn Git fundamentals, branching, merging, and collaborating on GitHub.",
          category: "Web Development",
          domain: "Dev Tools",
          subcategory: "Git & GitHub",
          course_level: "Beginner",
          language: "English",
          course_duration: "6 hours",
          is_published: true,
        },
        {
          title: "Responsive Web Design with Tailwind CSS",
          description:
            "Build responsive and beautiful websites faster using Tailwind CSS.",
          category: "Web Development",
          domain: "Frontend",
          subcategory: "Tailwind CSS",
          course_level: "Intermediate",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },

        // 💻 FRONTEND DEVELOPMENT
        {
          title: "Modern React with Hooks and Context",
          description:
            "Build dynamic UI using React hooks, context API, and reusable components.",
          category: "Frontend Development",
          domain: "Frontend",
          subcategory: "React",
          course_level: "Intermediate",
          language: "English",
          course_duration: "10 hours",
          is_published: true,
        },
        {
          title: "Advanced React Patterns",
          description:
            "Explore HOCs, render props, compound components, and performance optimization.",
          category: "Frontend Development",
          domain: "Frontend",
          subcategory: "React Advanced",
          course_level: "Advanced",
          language: "English",
          course_duration: "9 hours",
          is_published: true,
        },
        {
          title: "TypeScript for React Developers",
          description:
            "Add type safety and scalability to React projects using TypeScript.",
          category: "Frontend Development",
          domain: "Frontend",
          subcategory: "TypeScript",
          course_level: "Intermediate",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },
        {
          title: "React Router & Navigation",
          description:
            "Master client-side routing, nested routes, and protected routes in React apps.",
          category: "Frontend Development",
          domain: "Frontend",
          subcategory: "React Router",
          course_level: "Intermediate",
          language: "English",
          course_duration: "5 hours",
          is_published: true,
        },
        {
          title: "Next.js Full Guide",
          description:
            "Build SSR and SSG web applications using Next.js framework.",
          category: "Frontend Development",
          domain: "Frontend",
          subcategory: "Next.js",
          course_level: "Advanced",
          language: "English",
          course_duration: "12 hours",
          is_published: true,
        },

        // ⚙️ BACKEND DEVELOPMENT
        {
          title: "Node.js & Express.js API Development",
          description:
            "Build scalable REST APIs using Node.js, Express, and MongoDB.",
          category: "Backend Development",
          domain: "Backend",
          subcategory: "Node.js",
          course_level: "Intermediate",
          language: "English",
          course_duration: "10 hours",
          is_published: true,
        },
        {
          title: "Spring Boot for Java Developers",
          description:
            "Learn to create RESTful services and microservices with Spring Boot.",
          category: "Backend Development",
          domain: "Backend",
          subcategory: "Spring Boot",
          course_level: "Intermediate",
          language: "English",
          course_duration: "15 hours",
          is_published: true,
        },
        {
          title: "Building GraphQL APIs with Node.js",
          description:
            "Learn to build flexible APIs using GraphQL and Apollo Server.",
          category: "Backend Development",
          domain: "Backend",
          subcategory: "GraphQL",
          course_level: "Intermediate",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },
        {
          title: "Authentication & Authorization in Web Apps",
          description:
            "Implement JWT, OAuth2, and role-based access control for secure apps.",
          category: "Backend Development",
          domain: "Backend",
          subcategory: "Security",
          course_level: "Advanced",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },
        {
          title: "RESTful API Design Principles",
          description:
            "Understand how to design scalable, well-structured, and secure APIs.",
          category: "Backend Development",
          domain: "Backend",
          subcategory: "API Design",
          course_level: "Intermediate",
          language: "English",
          course_duration: "6 hours",
          is_published: true,
        },

        // 📱 MOBILE DEVELOPMENT
        {
          title: "React Native Crash Course",
          description:
            "Develop cross-platform mobile applications using React Native and Expo.",
          category: "Mobile Development",
          domain: "Mobile",
          subcategory: "React Native",
          course_level: "Intermediate",
          language: "English",
          course_duration: "10 hours",
          is_published: true,
        },
        {
          title: "Flutter from Scratch",
          description:
            "Build native Android and iOS apps with Flutter and Dart.",
          category: "Mobile Development",
          domain: "Mobile",
          subcategory: "Flutter",
          course_level: "Intermediate",
          language: "English",
          course_duration: "12 hours",
          is_published: true,
        },
        {
          title: "Flutter State Management",
          description:
            "Use Provider, Riverpod, and Bloc for managing app state efficiently.",
          category: "Mobile Development",
          domain: "Mobile",
          subcategory: "State Management",
          course_level: "Intermediate",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },
        {
          title: "Mobile App UI/UX Design",
          description:
            "Design user-friendly mobile interfaces using Figma and Material Design.",
          category: "Mobile Development",
          domain: "Mobile",
          subcategory: "UI/UX",
          course_level: "Beginner",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },
        {
          title: "Publishing Apps to Play Store & App Store",
          description:
            "Learn the step-by-step process to publish and manage your mobile apps.",
          category: "Mobile Development",
          domain: "Mobile",
          subcategory: "Deployment",
          course_level: "Intermediate",
          language: "English",
          course_duration: "5 hours",
          is_published: true,
        },

        // 🗄️ DATABASES - MYSQL
        {
          title: "MySQL Database Fundamentals",
          description:
            "Learn SQL queries, normalization, and relational database concepts with MySQL.",
          category: "Database",
          domain: "SQL",
          subcategory: "MySQL",
          course_level: "Beginner",
          language: "English",
          course_duration: "10 hours",
          is_published: true,
        },
        {
          title: "Advanced MySQL Queries and Joins",
          description:
            "Master subqueries, joins, indexing, and stored procedures.",
          category: "Database",
          domain: "SQL",
          subcategory: "MySQL Advanced",
          course_level: "Intermediate",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },
        {
          title: "Database Design & Modeling with MySQL",
          description:
            "Design efficient relational databases using ER diagrams and normalization rules.",
          category: "Database",
          domain: "SQL",
          subcategory: "Database Design",
          course_level: "Intermediate",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },

        // 🍃 DATABASES - MONGODB
        {
          title: "MongoDB for Beginners",
          description:
            "Learn NoSQL concepts, CRUD operations, and indexing with MongoDB.",
          category: "Database",
          domain: "NoSQL",
          subcategory: "MongoDB",
          course_level: "Beginner",
          language: "English",
          course_duration: "9 hours",
          is_published: true,
        },
        {
          title: "Mongoose ODM with Node.js",
          description:
            "Connect and interact with MongoDB efficiently using Mongoose in Node.js.",
          category: "Database",
          domain: "NoSQL",
          subcategory: "Mongoose",
          course_level: "Intermediate",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },
        {
          title: "MongoDB Aggregation and Performance Optimization",
          description:
            "Use aggregation pipelines and indexing for faster MongoDB queries.",
          category: "Database",
          domain: "NoSQL",
          subcategory: "Aggregation",
          course_level: "Advanced",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },

        // 🐘 DATABASES - POSTGRESQL
        {
          title: "PostgreSQL Essentials",
          description:
            "Master PostgreSQL installation, basic SQL, and relational schema creation.",
          category: "Database",
          domain: "SQL",
          subcategory: "PostgreSQL",
          course_level: "Beginner",
          language: "English",
          course_duration: "9 hours",
          is_published: true,
        },
        {
          title: "PostgreSQL Advanced Features",
          description:
            "Work with triggers, stored functions, and JSONB data in PostgreSQL.",
          category: "Database",
          domain: "SQL",
          subcategory: "PostgreSQL Advanced",
          course_level: "Intermediate",
          language: "English",
          course_duration: "8 hours",
          is_published: true,
        },
        {
          title: "Database Optimization & Indexing in PostgreSQL",
          description:
            "Learn how to optimize query performance and database structure.",
          category: "Database",
          domain: "SQL",
          subcategory: "PostgreSQL Optimization",
          course_level: "Advanced",
          language: "English",
          course_duration: "7 hours",
          is_published: true,
        },
      ];

      const results = await Promise.all(
        latestCourses.map((course) => supabase.from("courses").insert([course]))
      );

      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        console.error("Errors occurred while adding courses:", errors);
        alert(
          `Some errors occurred while adding courses. Check console for details.`
        );
      } else {
        loadData();
        alert("Latest programming courses added successfully!");
      }
    } catch (error) {
      console.error("Error adding courses:", error);
      alert("Error adding courses. Please try again.");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor_id &&
        getExpertName(course.instructor_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (course.subcategory || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (course.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (course.domain || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (category: string) => {
    return category || "N/A";
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategories: Record<string, string> = {
      react: "React",
      "react-native": "React Native",
      flutter: "Flutter",
      python: "Python",
      "spring-boot": "Spring Boot",
      "node-js": "Node.js",
      "express-js": "Express.js",
      mysql: "MySQL",
    };
    return subcategories[subcategoryId] || subcategoryId;
  };

  const getExpertName = (expertId: string) => {
    const expert = experts.find((e) => e.id === expertId);
    return expert
      ? expert.full_name || expert.email || "Unknown Expert"
      : "No Instructor";
  };

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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Course Management
        </h2>
        {/* <div className="flex gap-2">
          <button
            onClick={testDatabaseConnection}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Test DB
          </button>
          <button
            onClick={addLatestProgrammingCourse}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={20} />
            Add Latest Programming Courses
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div> */}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search courses..."
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
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {course.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getSubcategoryName(course.subcategory || "")} •{" "}
                          {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {course.instructor_id
                      ? getExpertName(course.instructor_id)
                      : "No Instructor"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {getCategoryName(course.category || "") || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {course.domain || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {course.course_level || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {course.language || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        course.is_published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trainer
                </label>
                <select
                  value={formData.instructor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a Trainer</option>
                  {experts.map((expert) => (
                    <option key={expert.id} value={expert.id}>
                      {expert.full_name ||
                        expert.email ||
                        `Expert ${expert.id.substring(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Web Development"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  placeholder="e.g., Frontend, Backend, Data"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Subcategory</option>
                  <option value="react">React</option>
                  <option value="react-native">React Native</option>
                  <option value="flutter">Flutter</option>
                  <option value="python">Python</option>
                  <option value="spring-boot">Spring Boot</option>
                  <option value="node-js">Node.js</option>
                  <option value="express-js">Express.js</option>
                  <option value="mysql">MySQL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Level
                  </label>
                  <select
                    value={formData.course_level}
                    onChange={(e) =>
                      setFormData({ ...formData, course_level: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Duration
                </label>
                <input
                  type="text"
                  value={formData.course_duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course_duration: e.target.value,
                    })
                  }
                  placeholder="e.g., 10 hours, 5 weeks"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is_published"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Publish course
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingCourse ? "Update Course" : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
