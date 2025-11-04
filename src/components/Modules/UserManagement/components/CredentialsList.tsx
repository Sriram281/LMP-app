import { Trash2, Search, FileText, CheckCircle, XCircle } from "lucide-react";
import { Profile } from "../../../../lib/supabase";
import { useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface CredentialsListProps {
  users: Profile[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (user: Profile) => void;
  onDelete: (id: string) => void;
  onToggleActive: (user: Profile) => void;
}

export default function CredentialsList({
  users,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onToggleActive,
}: CredentialsListProps) {
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>(
    users.reduce((acc, user) => {
      // Determine initial status based on is_active value
      let status = "Draft";
      if (user.is_active === true) {
        status = "Active";
      } else if (user.is_active === false) {
        status = "Disable";
      }
      acc[user.id] = status;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      let is_active: boolean | null = null;

      // Map status to is_active value
      if (newStatus === "Active") {
        is_active = true;
      } else if (newStatus === "Disable") {
        is_active = false;
      } else if (newStatus === "Draft") {
        is_active = null;
      }
      // For "Draft", is_active remains null

      // Update in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ is_active })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUserStatuses((prev) => ({
        ...prev,
        [userId]: newStatus,
      }));

      // Trigger a refresh in parent component
      onToggleActive(users.find((u) => u.id === userId) || users[0]);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Registration Date
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
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {user.full_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {/* <span
                    className={`px-3 py-1 text-xs font-medium rounded-full capitalize 
                        ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : user.role === "instructor"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }
                    `}
                  > */}
                  {user.role}
                  {/* </span> */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <select
                      value={
                        userStatuses[user.id] ||
                        (user.is_active === true
                          ? "Active"
                          : user.is_active === false
                          ? "Disable"
                          : "Draft")
                      }
                      onChange={(e) =>
                        handleStatusChange(user.id, e.target.value)
                      }
                      className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Draft" className="flex items-center gap-2">
                        <FileText size={12} className="inline mr-1" />
                        Draft
                      </option>
                      <option
                        value="Active"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle size={12} className="inline mr-1" />
                        Active
                      </option>
                      <option
                        value="Disable"
                        className="flex items-center gap-2"
                      >
                        <XCircle size={12} className="inline mr-1" />
                        Disable
                      </option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDelete(user.id)}
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
    </div>
  );
}
