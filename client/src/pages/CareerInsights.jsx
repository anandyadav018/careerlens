import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { resumeApi } from '../api/resumeApi';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { BarChart2, TrendingUp, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

const CareerInsights = () => {
  const [state, setState] = useState({
    trending: [],
    gaps: null,
    activeResume: null,
    loading: true,
  });

  useEffect(() => {
    const load = async () => {
      const [trendRes, gapRes, resumeRes] = await Promise.allSettled([
        analyticsApi.getTrendingSkills(),
        analyticsApi.getSkillGaps(),
        resumeApi.getUserResumes(),
      ]);

      const trending = trendRes.status === 'fulfilled' ? trendRes.value.data || [] : [];
      const gapData  = gapRes.status  === 'fulfilled' ? gapRes.value.data        : null;
      const resumes  = resumeRes.status === 'fulfilled' ? resumeRes.value.data   : [];
      const active   = resumes.find((r) => r.isActive) || resumes[0] || null;

      setState({ trending, gaps: gapData, activeResume: active, loading: false });
    };
    load();
  }, []);

  const { trending, gaps, activeResume, loading } = state;
  const maxCount = trending[0]?.count || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header pb-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={18} className="text-warning-600" />
          <h1 className="page-title">Career Insights</h1>
        </div>
        <p className="page-subtitle">What the market wants — and where you stand.</p>
      </div>

      <div className="p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ── Trending Skills ── */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <TrendingUp size={15} className="text-warning-500" /> Most Demanded Skills
              </h2>
              <span className="text-xs text-neutral-400">From job postings</span>
            </div>
            <div className="card-section space-y-3">
              {trending.length === 0 ? (
                <EmptyState
                  icon={<BarChart2 size={20} />}
                  title="No data yet"
                  description="Trending skills will appear once jobs are scraped."
                />
              ) : (
                trending.slice(0, 15).map(({ skill, count }, i) => (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 w-5 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <ProgressBar
                        value={Math.round((count / maxCount) * 100)}
                        label={skill}
                        size="sm"
                        color="blue"
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-12 text-right flex-shrink-0">
                      {count} jobs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Skill Gap Analysis ── */}
          <div className="space-y-5">
            {/* User skills */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Your Skills</h2>
                {activeResume && (
                  <Link to={`/resumes/${activeResume._id}/analysis`} className="text-xs text-primary-600 font-medium hover:underline">
                    from resume
                  </Link>
                )}
              </div>
              <div className="card-section">
                {!activeResume ? (
                  <EmptyState
                    icon={<FileText size={20} />}
                    title="No resume uploaded"
                    description="Upload your resume to see your skill profile."
                    action={
                      <Link to="/resumes/upload">
                        <Button size="sm">Upload Resume</Button>
                      </Link>
                    }
                  />
                ) : gaps?.userSkills ? (
                  <div className="space-y-3">
                    {Object.entries(gaps.userSkills)
                      .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
                      .map(([category, skills]) => (
                        <div key={category}>
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 capitalize">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {skills.map((s) => (
                              <span key={s} className={`skill-tag ${category}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">No skills found in resume.</p>
                )}
              </div>
            </div>

            {/* Gaps to close */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <AlertTriangle size={14} className="text-warning-500" /> Skill Gaps to Close
                </h2>
                <span className="text-xs text-neutral-400">vs. job market</span>
              </div>
              <div className="card-section">
                {!activeResume ? (
                  <p className="text-sm text-neutral-400">Upload your resume to see gaps.</p>
                ) : !gaps?.skillGaps?.length ? (
                  <div className="flex items-center gap-3 p-3 bg-success-50 rounded-xl border border-success-100">
                    <span className="text-success-600 text-lg">🎉</span>
                    <p className="text-sm text-success-700 font-medium">
                      Your resume covers most in-demand skills!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {gaps.skillGaps.map(({ skill, demandCount }, i) => (
                      <div key={skill} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="text-warning-500 text-xs font-bold w-5">#{i + 1}</span>
                          <span className="text-sm font-medium text-neutral-800">{skill}</span>
                        </div>
                        <span className="text-xs text-neutral-400">{demandCount} jobs need this</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── What to Learn Next ── */}
        {gaps?.skillGaps?.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Lightbulb size={15} className="text-primary-500" /> What to Learn Next
              </h2>
            </div>
            <div className="card-section">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gaps.skillGaps.slice(0, 6).map(({ skill, demandCount }) => (
                  <div
                    key={skill}
                    className="p-4 border border-neutral-100 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-colors cursor-default"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-neutral-800 text-sm">{skill}</p>
                      <span className="badge badge-blue flex-shrink-0">#{gaps.skillGaps.findIndex((g) => g.skill === skill) + 1}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{demandCount} jobs currently need this</p>
                    <div className="mt-3">
                      <ProgressBar
                        value={Math.round((demandCount / (gaps.skillGaps[0]?.demandCount || 1)) * 100)}
                        size="sm"
                        color="blue"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerInsights;
