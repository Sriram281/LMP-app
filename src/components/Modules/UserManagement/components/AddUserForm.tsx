import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase, Profile } from "../../../../lib/supabase";

interface AddUserFormProps {
  onUserAdded: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
  // Form data with new fields (removed is_active)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    industry_type: "",
    address: "",
    city: "",
    state: "",
    country: "",
    role: "student",
  });

  // Permission data for modules
  const [permissions, setPermissions] = useState([
    { id: "dashboard", name: "Dashboard", enabled: false },
    { id: "courses", name: "Courses", enabled: false },
    { id: "users", name: "Users", enabled: false },
    { id: "experts", name: "Experts", enabled: false },
    { id: "discussions", name: "Discussions", enabled: false },
    { id: "reports", name: "Reports", enabled: false },
    { id: "certificates", name: "Certificates", enabled: false },
    { id: "settings", name: "Settings", enabled: false },
  ]);

  // Track if we're editing an existing user
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Existing users for searchable dropdown
  const [existingUsers, setExistingUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Load existing users for the dropdown
  useEffect(() => {
    loadExistingUsers();
  }, []);

  const loadExistingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setExistingUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error loading existing users:", error);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(existingUsers);
    } else {
      const filtered = existingUsers.filter((user) =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, existingUsers]);

  // Handle selecting a user from the dropdown
  const handleSelectUser = (user: Profile) => {
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      industry_type: user.industry_type || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
      role: user.role || "student",
    });

    // Set permissions if they exist
    if (user.permission && Array.isArray(user?.permission)) {
      const updatedPermissions: any = permissions.map((permission) => ({
        ...permission,
        enabled: user.permission?.includes(permission.id),
      }));
      setPermissions(updatedPermissions);
    }

    // Set the editing user ID
    setEditingUserId(user.id);
    setSearchTerm("");
    setShowDropdown(false);
  };

  // Handle form submission (either create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      // Update existing user
      await handleUpdateUser();
    } else {
      // Create new user
      await handleAddUser();
    }
  };

  const handleAddUser = async () => {
    try {
      // Create a new user in Supabase auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: "TempPass123!", // Temporary password
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          role: formData.role,
        },
      });

      if (error) throw error;

      // Create profile with additional fields (default is_active to true)
      if (data.user) {
        // Prepare permission array from enabled permissions
        const enabledPermissions = permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id);

        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          industry_type: formData.industry_type,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          role: formData.role,
          is_active: true, // Default to active
          permission: enabledPermissions, // Store permission array
        });

        if (profileError) throw profileError;
      }

      // Reset form
      resetForm();
      onUserAdded();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;

    try {
      // Update auth user metadata
    //   const { error: authError } = await supabase.auth.admin.updateUserById(
    //     editingUserId,
    //     {
    //       user_metadata: {
    //         full_name: formData.full_name,
    //         role: formData.role,
    //       },
    //     }
    //   );

    //   if (authError) throw authError;

      // Prepare permission array from enabled permissions
      const enabledPermissions = permissions
        .filter((permission) => permission.enabled)
        .map((permission) => permission.id);

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: formData.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          industry_type: formData.industry_type,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          role: formData.role,
          permission: enabledPermissions,
        })
        .eq("id", editingUserId);

      if (profileError) throw profileError;

      // Reset form
      resetForm();
      onUserAdded();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone_number: "",
      industry_type: "",
      address: "",
      city: "",
      state: "",
      country: "",
      role: "student",
    });

    // Reset permissions to default
    setPermissions([
      { id: "dashboard", name: "Dashboard", enabled: true },
      { id: "courses", name: "Courses", enabled: true },
      { id: "experts", name: "Experts", enabled: true },
      { id: "discussions", name: "Discussions", enabled: true },
      { id: "reports", name: "Reports", enabled: false },
      { id: "certificates", name: "Certificates", enabled: false },
      { id: "settings", name: "Settings", enabled: false },
    ]);

    setEditingUserId(null);
  };

  const handlePermissionToggle = (id: string) => {
    setPermissions(
      permissions.map((permission) =>
        permission.id === id
          ? { ...permission, enabled: !permission.enabled }
          : permission
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        {editingUserId ? "Update User" : "Add New User"}
      </h3>
      
      {/* Searchable Dropdown at Top Right */}
      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select User
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() =>
                // Delay hiding dropdown to allow clicking on items
                setTimeout(() => setShowDropdown(false), 200)
              }
              placeholder="Search existing users..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {showDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-60 overflow-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
                    onMouseDown={() => handleSelectUser(user)} // Use onMouseDown to prevent blur before click
                  >
                    <div className="font-medium text-gray-800 dark:text-white">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry Type
            </label>
            <input
              type="text"
              value={formData.industry_type}
              onChange={(e) =>
                setFormData({ ...formData, industry_type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="student">Client</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Permission Section - Right under Role field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                  Modules
                </h4>
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">
                  Access
                </h4>
              </div>

              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission.name}
                    </span>
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={permission.enabled}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-center items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {editingUserId ? "Update User" : "Save User"}
          </button>
          {editingUserId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}