import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'demo@careerlens.ai',
      password: 'password123',
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
        {/* ── Left Column: Visual Brand Experience (hidden on small screens) ── */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Ambient glow lights */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center shadow-md shadow-primary-500/30 group-hover:scale-105 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                CareerLens<span className="text-primary-400">.ai</span>
              </span>
            </Link>
          </div>

          {/* Centerpiece Content */}
          <div className="relative z-10 space-y-6 my-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-primary-300">
              <span className="pulse-dot" /> Live Indian Job Feed (24h TTL)
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Sign in to unlock AI-powered job matching & ATS analysis.
            </h1>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Every cycle, CareerLens indexes verified engineering opportunities from Internshala and Indeed India, scoring your resume against each opening in real time.
            </p>

            {/* Testimonial / Proof Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                ★★★★★ <span className="text-neutral-300 font-normal ml-1">Verified User</span>
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed italic">
                "The 24h freshness filter completely changed my search. I applied to an Internshala listing within 1 hour of it going live and got an interview call the very next morning."
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <span className="font-semibold text-white">Aditya R.</span>
                <span className="text-neutral-400">Software Engineer · Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Footer status pill */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Secure SSL Authentication
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> 50+ New Jobs Today
            </span>
          </div>
        </div>

        {/* ── Right Column: Interactive Login Card ── */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
          {/* Top navigation */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft size={14} /> Back to home
            </Link>

            <span className="text-xs text-neutral-500">
              New here?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                Create free account
              </Link>
            </span>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto my-auto py-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-neutral-500 mt-1.5">
                Sign in to view your personalized matches and ATS scores.
              </p>
            </div>

            {/* Quick 1-Click Demo Fill Button */}
            <div className="mb-6 p-3.5 bg-primary-50/80 border border-primary-100 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-950 leading-tight">Testing the platform?</p>
                  <p className="text-[11px] text-primary-700 leading-tight mt-0.5">Use pre-filled demo credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Autofill Demo
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-neutral-400 font-medium">Or enter credentials</span>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center shadow-md shadow-primary-600/20 font-bold text-sm py-3"
                  isLoading={isSubmitting}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}
                </Button>
              </div>
            </form>

            <p className="text-[11px] text-neutral-400 text-center mt-6">
              By signing in, you agree to CareerLens's Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Bottom copyright */}
          <div className="text-center lg:text-left text-xs text-neutral-400">
            © {new Date().getFullYear()} CareerLens AI · Empowering Indian Tech Careers
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
