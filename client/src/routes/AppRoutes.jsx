import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home         from '../pages/Home';
import Login        from '../pages/Login';
import Register     from '../pages/Register';

// Onboarding
import Onboarding   from '../pages/Onboarding';

// App pages
import Dashboard        from '../pages/Dashboard';
import ResumeUpload     from '../pages/ResumeUpload';
import ResumeAnalysis   from '../pages/ResumeAnalysis';
import Resumes          from '../pages/Resumes';
import JobListings      from '../pages/JobListings';
import JobDetail        from '../pages/JobDetail';
import FreshJobs        from '../pages/FreshJobs';
import CoverLetter      from '../pages/CoverLetter';
import InterviewPrep    from '../pages/InterviewPrep';
import Applications     from '../pages/Applications';
import AlertSettings    from '../pages/AlertSettings';
import Profile          from '../pages/Profile';
import CareerInsights   from '../pages/CareerInsights';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <p className="text-6xl font-bold text-neutral-200 mb-4">404</p>
    <h1 className="text-xl font-semibold text-neutral-700 mb-2">Page not found</h1>
    <p className="text-neutral-400 mb-6">The page you're looking for doesn't exist.</p>
    <a href="/" className="text-primary-600 font-medium hover:underline">Go home</a>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected Routes ── */}
      <Route element={<ProtectedRoute />}>
        {/* Onboarding — shown right after registration */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboard */}
        <Route path="/dashboard"  element={<Dashboard />} />

        {/* Resumes */}
        <Route path="/resumes"                  element={<Resumes />} />
        <Route path="/resumes/upload"           element={<ResumeUpload />} />
        <Route path="/resumes/:id/analysis"     element={<ResumeAnalysis />} />

        {/* Jobs */}
        <Route path="/jobs"                     element={<JobListings />} />
        <Route path="/jobs/fresh"               element={<FreshJobs />} />
        <Route path="/jobs/:id"                 element={<JobDetail />} />
        <Route path="/jobs/:id/cover-letter"    element={<CoverLetter />} />
        <Route path="/jobs/:id/interview-prep"  element={<InterviewPrep />} />

        {/* Applications */}
        <Route path="/applications"             element={<Applications />} />

        {/* Career */}
        <Route path="/career-insights"          element={<CareerInsights />} />
        <Route path="/interview-prep"           element={<InterviewPrep />} />

        {/* Account */}
        <Route path="/alerts"                   element={<AlertSettings />} />
        <Route path="/profile"                  element={<Profile />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
