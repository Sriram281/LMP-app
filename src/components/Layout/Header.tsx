import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome back, {profile?.full_name || "User"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            Role:{" "}
            {profile?.role === "student" ? "Client" : profile?.role || "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {profile?.full_name?.charAt(0).toUpperCase() || (
                  <User size={20} />
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.email}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
