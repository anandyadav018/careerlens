import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeApi } from '../api/resumeApi';
import ScoreRing from '../components/resume/ScoreRing';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import {
  CheckCircle, AlertCircle, ArrowLeft, FileText,
  ChevronRight, Lightbulb, Tag, ArrowRight,
} from 'lucide-react';

const SKILL_CATEGORIES = ['technical', 'soft', 'tools', 'languages'];

const ResumeAnalysis = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    resumeApi.getResumeById(id)
      .then((res) => setResume(res.data))
      .catch(() => setError('Failed to load resume analysis.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-danger-600 mb-4">{error || 'Resume not found.'}</p>
          <Link to="/resumes"><Button variant="secondary">Back to resumes</Button></Link>
        </div>
      </div>
    );
  }

  const { aiAnalysis, skills, parsedData, fileName, label } = resume;
  const displayName = label || fileName;

  const TABS = [
    { id: 'overview',         label: 'Overview' },
    { id: 'sections',         label: 'Sections' },
    { id: 'skills',           label: 'Skills' },
    { id: 'recommendations',  label: 'Suggestions' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/resumes" className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-700 transition-colors">
            <ArrowLeft size={14} /> Resumes
          </Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <span className="text-sm text-neutral-600 truncate max-w-48">{displayName}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Resume Analysis</h1>
            <p className="page-subtitle">{displayName}</p>
          </div>
          <Link to="/jobs">
            <Button icon={<ArrowRight size={14} />} iconPosition="right" size="sm">
              Find matching jobs
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-6 flex items-center gap-6">
                <ScoreRing score={aiAnalysis?.atsScore ?? 0} size={96} stroke={9} />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-1">ATS Score</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    How well ATS systems can parse and rank your resume.
                  </p>
                </div>
              </div>
              <div className="card p-6 flex items-center gap-6">
                <ScoreRing score={aiAnalysis?.overallScore ?? 0} size={96} stroke={9} />
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-1">Overall Score</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Combined quality — impact, clarity, formatting.
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
                  <CheckCircle size={15} className="text-success-600" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {(aiAnalysis?.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500 flex-shrink-0 mt-1.5" />
                      {s}
                    </li>
                  ))}
                  {(!aiAnalysis?.strengths?.length) && (
                    <li className="text-sm text-neutral-400">No strengths detected.</li>
                  )}
                </ul>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
                  <AlertCircle size={15} className="text-warning-600" /> Improvements
                </h3>
                <ul className="space-y-2">
                  {(aiAnalysis?.improvements || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning-400 flex-shrink-0 mt-1.5" />
                      {s}
                    </li>
                  ))}
                  {(!aiAnalysis?.improvements?.length) && (
                    <li className="text-sm text-neutral-400">None detected.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Missing keywords */}
            {aiAnalysis?.keywords?.missing?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-neutral-800 flex items-center gap-2 mb-4">
                  <Tag size={15} className="text-danger-500" /> Missing Keywords
                </h3>
                <p className="text-xs text-neutral-400 mb-3">
                  Adding these to your resume will improve ATS ranking significantly.
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keywords.missing.map((kw) => (
                    <span key={kw} className="skill-tag missing">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted info */}
            <div className="card p-5">
              <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <FileText size={15} className="text-neutral-400" /> Extracted Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Name',       value: parsedData?.name || '—' },
                  { label: 'Email',      value: parsedData?.email || '—' },
                  { label: 'Experience', value: `${parsedData?.experience?.length || 0} roles` },
                  { label: 'Education',  value: `${parsedData?.education?.length || 0} degrees` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-neutral-800 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Sections Tab ── */}
        {activeTab === 'sections' && (
          <div className="space-y-4">
            {Object.entries(aiAnalysis?.sections || {})
              .filter(([, v]) => v?.score != null)
              .map(([section, data]) => (
                <div key={section} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-neutral-800 capitalize">{section}</h3>
                    <span className={`text-sm font-bold ${
                      data.score >= 80 ? 'text-success-600' : data.score >= 60 ? 'text-warning-600' : 'text-danger-600'
                    }`}>
                      {data.score}/100
                    </span>
                  </div>
                  <ProgressBar value={data.score} size="md" />
                  {data.feedback && (
                    <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{data.feedback}</p>
                  )}
                </div>
              ))}
            {!aiAnalysis?.sections && (
              <p className="text-sm text-neutral-400 text-center py-8">No section analysis available.</p>
            )}
          </div>
        )}

        {/* ── Skills Tab ── */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            {SKILL_CATEGORIES.map((cat) =>
              skills?.[cat]?.length > 0 ? (
                <div key={cat} className="card p-5">
                  <h3 className="font-semibold text-neutral-800 capitalize mb-3">{cat} Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills[cat].map((s) => (
                      <span key={s} className={`skill-tag ${cat}`}>{s}</span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
            {/* Present keywords */}
            {aiAnalysis?.keywords?.present?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-success-500" /> Found Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keywords.present.map((kw) => (
                    <span key={kw} className="skill-tag technical">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Suggestions Tab ── */}
        {activeTab === 'recommendations' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={16} className="text-primary-500" />
              <p className="text-sm text-neutral-600">
                AI-generated rewrites of specific lines from your resume. Copy the <strong>After</strong> version.
              </p>
            </div>

            {(aiAnalysis?.recommendations || []).length > 0 ? (
              aiAnalysis.recommendations.map((rec, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="card-header">
                    <span className="badge badge-blue capitalize">{rec.section}</span>
                    {rec.reason && (
                      <p className="text-xs text-neutral-400 flex-1 ml-3 truncate">{rec.reason}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                    <div className="p-5">
                      <p className="text-xs font-semibold text-danger-500 uppercase tracking-wide mb-2">Before</p>
                      <p className="text-sm text-neutral-600 leading-relaxed">{rec.before}</p>
                    </div>
                    <div className="p-5 bg-success-50/40">
                      <p className="text-xs font-semibold text-success-600 uppercase tracking-wide mb-2">After</p>
                      <p className="text-sm text-neutral-800 leading-relaxed font-medium">{rec.after}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-8 text-center">
                <p className="text-sm text-neutral-400">
                  No specific recommendations generated for this resume.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;
