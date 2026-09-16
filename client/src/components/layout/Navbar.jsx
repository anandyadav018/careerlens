import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * PublicNavbar — shown on landing page and public routes.
 * Authenticated users see the sidebar instead.
 */
const Navbar = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-700 via-primary-600 to-indigo-500 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-neutral-900 text-base tracking-tight leading-none">
              CareerLens<span className="text-primary-600">.ai</span>
            </span>
            <span className="text-[10px] font-medium text-neutral-400 leading-tight mt-0.5">India AI Career Copilot</span>
          </div>
        </Link>

        {/* Live status badge */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200/80">
          <span className="pulse-dot" />
          <span className="text-neutral-500">Live Indian Job Boards:</span>
          <span className="font-semibold text-neutral-800">Internshala · Indeed · TimesJobs</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-medium text-neutral-600 hover:text-neutral-900">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              className="shadow-sm shadow-primary-600/20 font-semibold"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
