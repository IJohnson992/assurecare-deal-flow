
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  ClipboardList,
  Home,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/' },
    { name: 'Pipeline', icon: <ClipboardList className="h-5 w-5" />, path: '/pipeline' },
    { name: 'Reports', icon: <BarChart3 className="h-5 w-5" />, path: '/reports' },
    { name: 'Team', icon: <Users className="h-5 w-5" />, path: '/team' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col text-sidebar-foreground h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex justify-between items-center">
        <div className={cn("assurecare-logo", collapsed ? "hidden" : "flex")}>
          <div className="text-lg font-bold text-white">AssureCare</div>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/70"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 py-6">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-md mb-1",
                location.pathname === item.path
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          {!collapsed && currentUser && (
            <div className="flex-1 flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-white">{currentUser.name.charAt(0)}</span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/70">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "p-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/70",
              collapsed ? "mx-auto" : ""
            )}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
