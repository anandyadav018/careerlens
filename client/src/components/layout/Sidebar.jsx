import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  FolderKanban,
  FileText,
  BarChart2,
  MessageSquare,
  Bell,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',             icon: Briefcase,       label: 'Jobs' },
  { to: '/jobs/fresh',       icon: Zap,             label: 'Fresh Jobs', badge: 'NEW' },
  { to: '/applications',     icon: FolderKanban,    label: 'Applications' },
  { to: '/resumes',          icon: FileText,        label: 'Resume' },
  { to: '/career-insights',  icon: BarChart2,       label: 'Career Insights' },
  { to: '/interview-prep',   icon: MessageSquare,   label: 'Interview Prep' },
];

const BOTTOM_ITEMS = [
  { to: '/alerts',           icon: Bell,  label: 'Alerts' },
  { to: '/profile',          icon: User,  label: 'Profile' },
];

const NavItem = ({ to, icon: Icon, label, badge, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge && (
        <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : '?';

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="p-5 border-b border-neutral-100">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13V7l5-4 5 4v6H10V9.5a2 2 0 0 0-4 0V13H3Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-neutral-900 text-sm leading-none block">CareerLens</span>
            <span className="text-[10px] text-neutral-400 font-medium">AI Platform</span>
          </div>
        </Link>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-neutral-100" />

      {/* Bottom Nav */}
      <div className="p-3 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className="sidebar-nav-item w-full text-left hover:!text-danger-600 hover:!bg-danger-50"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-neutral-100">
        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-800 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
          <ChevronRight size={14} className="text-neutral-300 group-hover:text-neutral-500 flex-shrink-0" />
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
