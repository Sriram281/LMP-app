import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Award, Search } from "lucide-react";
import { supabase, Expert, Profile, Domain } from "../../lib/supabase";

export default function Experts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  // Updated form data to match requirements
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    profile_photo: "",
    gender: "",
    date_of_birth: "",
    designation: "",
    expertise_domains: [] as string[],
    experience_years: 0,
    current_organization: "",
    linkedin_url: "",
    bio: "",
    skills: [] as string[],
  });

  // Expertise domains options
  const expertiseDomainOptions = [
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "Spring Boot",
    "Django",
    "Flask",
    "C#",
    "Go",
    "Ruby on Rails",
    "PHP",
    "Laravel",
    "Swift",
    "Kotlin",
    "React Native",
    "Flutter",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "DevOps",
    "Data Science",
    "Machine Learning",
    "AI",
    "Blockchain",
  ];

  // Skills options
  const skillOptions = [
    "React",
    "Vue.js",
    "Angular",
    "Node.js",
    "Python",
    "Java",
    "Spring Boot",
    "Django",
    "Flask",
    "C#",
    ".NET",
    "Go",
    "Ruby",
    "Rails",
    "PHP",
    "Laravel",
    "Swift",
    "Kotlin",
    "React Native",
    "Flutter",
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "TailwindCSS",
    "Bootstrap",
    "SASS",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Git",
    "Jenkins",
    "CI/CD",
    "Agile",
    "Scrum",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expertsRes, profilesRes, domainsRes] = await Promise.all([
        supabase
          .from("experts")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
        supabase.from("domains").select("*"),
      ]);

      setExperts(expertsRes.data || []);
      setProfiles(profilesRes.data || []);
      setDomains(domainsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create expert data with new fields
      const expertData = {
        bio: formData.bio,
        years_experience: formData.experience_years,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        profile_photo: formData.profile_photo,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        designation: formData.designation,
        expertise_domain: formData.expertise_domains[0] || "", // Taking first domain for compatibility
        expertise_domains: formData.expertise_domains,
        experience_years: formData.experience_years,
        current_organization: formData.current_organization,
        linkedin_url: formData.linkedin_url,
        skills: formData.skills,
      };

      if (editingExpert) {
        await supabase
          .from("experts")
          .update(expertData)
          .eq("id", editingExpert.id);
      } else {
        await supabase.from("experts").insert([expertData]);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving expert:", error);
    }
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setFormData({
      full_name: expert.full_name || expert.profile?.full_name || "",
      email: expert.email || expert.profile?.email || "",
      phone_number: expert.phone_number || "",
      profile_photo: expert.profile_photo || expert.profile?.avatar_url || "",
      gender: expert.gender || "",
      date_of_birth: expert.date_of_birth || "",
      designation: expert.designation || "",
      expertise_domains:
        expert.expertise_domains ||
        (expert.domain?.name ? [expert.domain.name] : []),
      experience_years: expert.experience_years || expert.years_experience,
      current_organization: expert.current_organization || "",
      linkedin_url: expert.linkedin_url || "",
      bio: expert.bio || "",
      skills: expert.skills || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expert profile?"))
      return;

    try {
      await supabase.from("experts").delete().eq("id", id);
      loadData();
    } catch (error) {
      console.error("Error deleting expert:", error);
    }
  };

  const resetForm = () => {
    setEditingExpert(null);
    setFormData({
      full_name: "",
      email: "",
      phone_number: "",
      profile_photo: "",
      gender: "",
      date_of_birth: "",
      designation: "",
      expertise_domains: [],
      experience_years: 0,
      current_organization: "",
      linkedin_url: "",
      bio: "",
      skills: [],
    });
  };

  // Toggle expertise domain selection
  const toggleExpertiseDomain = (domain: string) => {
    setFormData((prev) => {
      const newDomains = prev.expertise_domains.includes(domain)
        ? prev.expertise_domains.filter((d) => d !== domain)
        : [...prev.expertise_domains, domain];
      return { ...prev, expertise_domains: newDomains };
    });
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  // Add custom expertise domain
  const addCustomExpertiseDomain = (domain: string) => {
    if (domain && !formData.expertise_domains.includes(domain)) {
      setFormData((prev) => ({
        ...prev,
        expertise_domains: [...prev.expertise_domains, domain],
      }));
    }
  };

  // Add custom skill
  const addCustomSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const testDataStorage = async () => {
    try {
      // Insert a test expert record
      const testExpert = {
        full_name: "Test Expert",
        email: "test.expert@example.com",
        phone_number: "+1 555 123 4567",
        expertise_domain: "Testing",
        years_experience: 2,
        designation: "QA Engineer",
        expertise_domains: ["Testing", "Automation"],
        experience_years: 2,
        current_organization: "Test Company",
        linkedin_url: "https://linkedin.com/in/testexpert",
        bio: "This is a test expert profile for verifying data storage functionality.",
        skills: ["Jest", "Cypress", "Selenium"],
        gender: "Other",
        profile_photo: "https://example.com/test-profile.jpg",
      };

      const { data, error } = await supabase.from("experts").insert(testExpert);

      if (error) {
        console.error("Error inserting test expert:", error);
        alert("Error inserting test expert. Check console for details.");
      } else {
        console.log("Test expert inserted successfully:", data);
        alert("Test expert inserted successfully!");
        loadData(); // Refresh the data to show the new expert
      }
    } catch (error) {
      console.error("Error in testDataStorage:", error);
      alert("Error in testDataStorage. Check console for details.");
    }
  };

  const filteredExperts = experts.filter(
    (expert) =>
      expert.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.expertise_domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProfiles = profiles; // Since we're not linking to profiles anymore, all profiles are available

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
          Experts / Developers
        </h2>
        <div className="flex gap-2">
          {/* <button
            onClick={testDataStorage}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Test Data Storage
          </button> */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Expert
          </button>
        </div>
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
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Table view instead of cards */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expertise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExperts.map((expert) => (
                <tr
                  key={expert.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {expert.profile_photo ? (
                          <img
                            src={expert.profile_photo}
                            alt={expert.full_name}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <span className="text-white font-semibold">
                            {expert.full_name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {expert.full_name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {expert.designation || "No designation"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {expert.email || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {expert.phone_number || "No phone"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {expert.expertise_domain || "No domain"}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expert.expertise_domains
                        ?.slice(0, 2)
                        .map((domain, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                          >
                            {domain}
                          </span>
                        ))}
                      {expert.expertise_domains &&
                        expert.expertise_domains.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                            +{expert.expertise_domains.length - 2}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {expert.experience_years || expert.years_experience} years
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Since {new Date(expert.created_at).getFullYear() || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {expert.current_organization || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(expert)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
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

        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No experts found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingExpert ? "Edit Expert Profile" : "Add New Expert"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  👤 Personal Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Photo
                    </label>
                    <input
                      type="text"
                      value={formData.profile_photo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile_photo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter photo URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  🎓 Professional Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter current role"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Organization
                    </label>
                    <input
                      type="text"
                      value={formData.current_organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          current_organization: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn / Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedin_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expertise Domains
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {expertiseDomainOptions.map((domain) => (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => toggleExpertiseDomain(domain)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.expertise_domains.includes(domain)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {domain}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom domain"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomExpertiseDomain(
                              (e.target as HTMLInputElement).value
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          if (input.value) {
                            addCustomExpertiseDomain(input.value);
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.expertise_domains.map((domain) => (
                        <span
                          key={domain}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-1"
                        >
                          {domain}
                          <button
                            type="button"
                            onClick={() => toggleExpertiseDomain(domain)}
                            className="text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio / Short Description
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of background and expertise..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills / Tools
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skillOptions.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.skills.includes(skill)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom skill"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomSkill(
                              (e.target as HTMLInputElement).value
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          if (input.value) {
                            addCustomSkill(input.value);
                            input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className="text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingExpert ? "Update Expert" : "Add Expert"}
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
