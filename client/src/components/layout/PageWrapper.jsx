import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import PublicNavbar from './Navbar';

/**
 * PageWrapper — Unified layout shell.
 *
 * Authenticated users get the app shell with left sidebar.
 * Public pages (login, register, landing) get the minimal top navbar.
 *
 * Props:
 *   noNavbar  {boolean}  — suppresses all chrome (used on auth pages)
 *   className {string}   — extra classes for the content area
 */
const PageWrapper = ({ children, noNavbar = false, className = '' }) => {
  const { isAuthenticated } = useAuth();

  // Auth pages (login, register) — no chrome at all
  if (noNavbar) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {children}
      </div>
    );
  }

  // Authenticated users — sidebar layout
  if (isAuthenticated) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="app-content">
          <main className={`flex-1 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Public pages — top navbar only
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PublicNavbar />
      <main className={`flex-1 flex flex-col ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageWrapper;
