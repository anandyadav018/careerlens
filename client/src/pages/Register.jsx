import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (validationErrors[id]) {
      setValidationErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const fieldErrors = {};
        err.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        setError(err.message || 'Failed to create account. Please check your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
        {/* ── Left Column: Visual Brand Experience ── */}
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
              <Sparkles size={12} /> Free Forever for Indian Engineers
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Build an unfair advantage in your job search.
            </h1>

            <div className="space-y-3.5 pt-2">
              {[
                'Instant Gemini ATS scoring on every resume version',
                'Fresh listings from Internshala & Indeed with 24h auto-expiry',
                'Automated skill gap breakdown based on target job postings',
                'Integrated application Kanban pipeline from Saved → Offer',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-neutral-200">
                  <div className="w-5 h-5 rounded-full bg-primary-500/20 border border-primary-400 flex items-center justify-center text-primary-300 shrink-0">
                    <CheckCircle size={12} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer status pill */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Free forever · No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" /> Setup in 30 seconds
            </span>
          </div>
        </div>

        {/* ── Right Column: Interactive Register Card ── */}
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
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </span>
          </div>

          {/* Form Container */}
          <div className="max-w-md w-full mx-auto my-auto py-8">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-neutral-500 mt-1.5">
                Join in 30 seconds and upload your resume for instant feedback.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User size={15} />
                    </div>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Anand"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium"
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="text-[11px] text-rose-600 mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User size={15} />
                    </div>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Yadav"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium"
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="text-[11px] text-rose-600 mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
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
                {validationErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5" htmlFor="password">
                  Password
                </label>
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
                    placeholder="Minimum 8 characters"
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
                {validationErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50/50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all font-medium"
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center shadow-md shadow-primary-600/20 font-bold text-sm py-3"
                  isLoading={isSubmitting}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account & Continue'}
                </Button>
              </div>
            </form>

            <p className="text-[11px] text-neutral-400 text-center mt-6">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
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

export default Register;
