import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  MessageSquare,
  FileText,
  BadgeCheck,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'Course Management', icon: BookOpen },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'experts', label: 'Experts / Developers', icon: Award },
  { id: 'discussions', label: 'Discussion Forum', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'certificates', label: 'Certificates', icon: BadgeCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeModule, onModuleChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">LMS Admin</h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onModuleChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
