import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { jobApi } from '../api/jobApi';
import { applicationApi } from '../api/applicationApi';
import { analyticsApi } from '../api/analyticsApi';
import { resumeApi } from '../api/resumeApi';
import JobCard from '../components/jobs/JobCard';
import ScoreRing from '../components/resume/ScoreRing';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import {
  FileText,
  Briefcase,
  Zap,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Clock,
  Building,
  AlertTriangle,
} from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const timeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  phone_screen: 'Phone screen',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

const STATUS_COLORS = {
  applied:      'badge badge-applied',
  phone_screen: 'badge badge-phone_screen',
  interview:    'badge badge-interview',
  offer:        'badge badge-offer',
  rejected:     'badge badge-rejected',
  saved:        'badge badge-saved',
};

const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton h-4 w-20 mb-2" />
    <div className="skeleton h-8 w-14" />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [state, setState] = useState({
    stats: null,
    recommendedJobs: [],
    recentApplications: [],
    activeResume: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, jobsRes, appsRes, resumesRes] = await Promise.allSettled([
          analyticsApi.getDashboardStats(),
          jobApi.getRecommendedJobs(),
          applicationApi.getApplications(),
          resumeApi.getUserResumes(),
        ]);

        const stats    = statsRes.status    === 'fulfilled' ? statsRes.value.data    : null;
        const jobs     = jobsRes.status     === 'fulfilled' ? jobsRes.value.data     : [];
        const apps     = appsRes.status     === 'fulfilled' ? appsRes.value.data     : [];
        const resumes  = resumesRes.status  === 'fulfilled' ? resumesRes.value.data  : [];
        const active   = resumes.find((r) => r.isActive) || resumes[0] || null;

        setState({
          stats,
          recommendedJobs: Array.isArray(jobs) ? jobs.slice(0, 6) : [],
          recentApplications: Array.isArray(apps) ? apps.slice(0, 5) : [],
          activeResume: active,
          loading: false,
          error: null,
        });
      } catch {
        setState((s) => ({ ...s, loading: false, error: 'Failed to load dashboard.' }));
      }
    };
    fetchAll();
  }, []);

  const { stats, recommendedJobs, recentApplications, activeResume, loading } = state;

  const atsScore     = stats?.resume?.atsScore     ?? (activeResume?.aiAnalysis?.atsScore     ?? null);
  const missingKeys  = stats?.resume?.missingKeywords ?? (activeResume?.aiAnalysis?.keywords?.missing ?? []);

  const appStats   = stats?.applications ?? {};
  const freshToday = stats?.freshJobsToday ?? 0;

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="page-header pb-6">
        <h1 className="page-title">
          {getGreeting()}, {user?.firstName}.
        </h1>
        <p className="page-subtitle">Here's what's happening with your job search.</p>
      </div>

      <div className="p-6 lg:p-8 space-y-8">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
            </>
          ) : (
            <>
              <Link to="/resumes" className="stat-card hover:shadow-md transition-shadow cursor-pointer block no-underline">
                <p className="stat-label flex items-center gap-1.5">
                  <FileText size={14} /> ATS Score
                </p>
                <p className="stat-value text-primary-600">
                  {atsScore !== null ? `${atsScore}` : '—'}
                </p>
                <p className="text-xs text-neutral-400">
                  {atsScore !== null ? (atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs work') : 'Upload resume'}
                </p>
              </Link>

              <Link to="/jobs" className="stat-card hover:shadow-md transition-shadow cursor-pointer block no-underline">
                <p className="stat-label flex items-center gap-1.5">
                  <Briefcase size={14} /> Job Matches
                </p>
                <p className="stat-value">{recommendedJobs.length}</p>
                <p className="text-xs text-neutral-400">Based on your skills</p>
              </Link>

              <Link to="/jobs/fresh" className="stat-card hover:shadow-md transition-shadow cursor-pointer block no-underline">
                <p className="stat-label flex items-center gap-1.5">
                  <Zap size={14} /> Fresh Today
                </p>
                <p className="stat-value text-success-600">{freshToday}</p>
                <p className="text-xs text-neutral-400">Posted last 24h</p>
              </Link>

              <Link to="/applications" className="stat-card hover:shadow-md transition-shadow cursor-pointer block no-underline">
                <p className="stat-label flex items-center gap-1.5">
                  <FolderKanban size={14} /> Active Apps
                </p>
                <p className="stat-value">{appStats.active ?? appStats.total ?? 0}</p>
                <p className="text-xs text-neutral-400">
                  {appStats.interviews ? `${appStats.interviews} interview${appStats.interviews > 1 ? 's' : ''}` : 'In pipeline'}
                </p>
              </Link>
            </>
          )}
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── LEFT: Resume Health ── */}
          <div className="xl:col-span-1 space-y-4">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Resume Health</h2>
                {activeResume && (
                  <Link to={`/resumes/${activeResume._id}/analysis`} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                    Details <ArrowRight size={12} />
                  </Link>
                )}
              </div>

              <div className="card-section">
                {loading ? (
                  <div className="flex justify-center py-6"><Spinner /></div>
                ) : activeResume && atsScore !== null ? (
                  <div className="space-y-5">
                    {/* Score ring */}
                    <div className="flex items-center gap-5">
                      <ScoreRing score={atsScore} size={88} stroke={8} />
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 mb-0.5">ATS Score</p>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {atsScore >= 80
                            ? 'Your resume is well-optimised for ATS.'
                            : atsScore >= 60
                            ? 'Good score — a few improvements will help.'
                            : 'Your resume needs some attention.'}
                        </p>
                        <Link to={`/resumes/${activeResume._id}/analysis`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Improve score
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Score breakdown */}
                    {activeResume.aiAnalysis?.sections && (
                      <div className="space-y-3 pt-2 border-t border-neutral-50">
                        {Object.entries(activeResume.aiAnalysis.sections)
                          .filter(([, v]) => v?.score != null)
                          .slice(0, 4)
                          .map(([section, data]) => (
                            <ProgressBar
                              key={section}
                              value={data.score}
                              label={section.charAt(0).toUpperCase() + section.slice(1)}
                              size="sm"
                            />
                          ))}
                      </div>
                    )}

                    {/* Missing keywords */}
                    {missingKeys.length > 0 && (
                      <div className="pt-3 border-t border-neutral-50">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                          Keywords to add
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingKeys.slice(0, 5).map((kw) => (
                            <span key={kw} className="skill-tag missing">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText size={20} />}
                    title="No resume yet"
                    description="Upload your resume to get an ATS score and personalized job matches."
                    action={
                      <Link to="/resumes/upload">
                        <Button size="sm">Upload Resume</Button>
                      </Link>
                    }
                  />
                )}
              </div>
            </div>

            {/* ── Skill Gap Widget ── */}
            {activeResume && missingKeys.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center gap-2">
                    <AlertTriangle size={15} className="text-warning-500" /> Skill Gaps
                  </h2>
                  <Link to="/career-insights" className="text-xs text-primary-600 font-medium hover:underline">
                    View all
                  </Link>
                </div>
                <div className="card-section space-y-2">
                  {missingKeys.slice(0, 4).map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-sm text-neutral-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning-400 flex-shrink-0" />
                      {skill}
                    </div>
                  ))}
                  <Link to="/career-insights">
                    <Button variant="ghost" size="sm" className="w-full mt-1 text-neutral-500">
                      View learning roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Jobs + Activity ── */}
          <div className="xl:col-span-2 space-y-6">
            {/* Recommended Jobs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-neutral-900">Recommended Jobs</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Based on skills from your active resume.</p>
                </div>
                <Link to="/jobs" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card p-5 space-y-3">
                      <div className="skeleton h-5 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : recommendedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedJobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Briefcase size={20} />}
                  title="No recommendations yet"
                  description={
                    activeResume
                      ? "We couldn't find matches yet. Try expanding your preferences."
                      : "Upload your resume to get personalized job matches."
                  }
                  action={
                    <Link to={activeResume ? '/jobs' : '/resumes/upload'}>
                      <Button size="sm" variant="secondary">
                        {activeResume ? 'Browse all jobs' : 'Upload resume'}
                      </Button>
                    </Link>
                  }
                />
              )}
            </div>

            {/* Application Activity */}
            {recentApplications.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Recent Activity</h2>
                  <Link to="/applications" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                    Full tracker <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="divide-y divide-neutral-50">
                  {recentApplications.map((app) => {
                    const job = app.jobId || app.jobSnapshot || {};
                    const title   = job.title   || app.jobSnapshot?.title   || 'Unknown role';
                    const company = job.company?.name || app.jobSnapshot?.company || '';
                    return (
                      <div key={app._id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <Building size={14} className="text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">{title}</p>
                          <p className="text-xs text-neutral-400">{company}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={STATUS_COLORS[app.status] || 'badge badge-gray'}>
                            {STATUS_LABELS[app.status] || app.status}
                          </span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock size={11} /> {timeAgo(app.updatedAt || app.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/jobs/fresh" className="card p-4 card-hover flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl bg-success-50 flex items-center justify-center flex-shrink-0">
                  <Zap size={16} className="text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Fresh Jobs</p>
                  <p className="text-xs text-neutral-400">Last 24 hours</p>
                </div>
              </Link>
              <Link to="/interview-prep" className="card p-4 card-hover flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Interview Prep</p>
                  <p className="text-xs text-neutral-400">Practice questions</p>
                </div>
              </Link>
              <Link to="/career-insights" className="card p-4 card-hover flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl bg-warning-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-warning-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Career Insights</p>
                  <p className="text-xs text-neutral-400">Skill trends</p>
                </div>
              </Link>
              <Link to="/resumes/upload" className="card p-4 card-hover flex items-center gap-3 no-underline">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Upload Resume</p>
                  <p className="text-xs text-neutral-400">New version</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
