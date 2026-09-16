import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../api/resumeApi';
import { useToast } from '../components/common/Toast';
import ScoreRing from '../components/resume/ScoreRing';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { FileText, Upload, Star, Trash2, Edit2, Check, X, BarChart2 } from 'lucide-react';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatSize = (bytes) => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const ResumeCard = ({ resume, onActivate, onDelete, onUpdateLabel }) => {
  const [editingLabel, setEditingLabel] = useState(false);
  const [label, setLabel] = useState(resume.label || '');

  const score = resume.aiAnalysis?.atsScore ?? resume.aiAnalysis?.overallScore ?? null;
  const displayName = resume.label || resume.fileName;

  const handleLabelSave = () => {
    onUpdateLabel(resume._id, label);
    setEditingLabel(false);
  };

  return (
    <div className={`card transition-all ${resume.isActive ? 'border-primary-300 ring-1 ring-primary-200' : ''}`}>
      <div className="flex items-start gap-4 p-5">
        {/* Score ring */}
        <div className="flex-shrink-0">
          {score !== null ? (
            <ScoreRing score={score} size={72} stroke={6} />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-neutral-100 flex items-center justify-center">
              <FileText size={20} className="text-neutral-300" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Name / label */}
          <div className="flex items-center gap-2 mb-1">
            {editingLabel ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  autoFocus
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLabelSave();
                    if (e.key === 'Escape') setEditingLabel(false);
                  }}
                  className="form-input h-7 text-sm flex-1"
                  placeholder="e.g. Frontend Resume"
                />
                <button onClick={handleLabelSave} className="text-success-600 hover:text-success-700"><Check size={15} /></button>
                <button onClick={() => setEditingLabel(false)} className="text-neutral-400 hover:text-neutral-600"><X size={15} /></button>
              </div>
            ) : (
              <>
                <p className="font-semibold text-neutral-900 text-sm truncate">{displayName}</p>
                {resume.isActive && (
                  <span className="badge badge-green flex-shrink-0">Active</span>
                )}
                <button
                  onClick={() => setEditingLabel(true)}
                  className="text-neutral-300 hover:text-neutral-500 flex-shrink-0"
                  title="Rename"
                >
                  <Edit2 size={13} />
                </button>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400 mb-3">
            <span>Version {resume.version}</span>
            <span>{formatDate(resume.createdAt)}</span>
            {resume.fileSize && <span>{formatSize(resume.fileSize)}</span>}
          </div>

          {/* Section breakdown mini bars */}
          {resume.aiAnalysis?.sections && (
            <div className="space-y-1.5">
              {Object.entries(resume.aiAnalysis.sections)
                .filter(([, v]) => v?.score != null)
                .slice(0, 3)
                .map(([section, data]) => (
                  <div key={section} className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400 w-20 capitalize flex-shrink-0">{section}</span>
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          data.score >= 80 ? 'bg-success-500' : data.score >= 60 ? 'bg-warning-500' : 'bg-danger-500'
                        }`}
                        style={{ width: `${data.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-8 text-right flex-shrink-0">{data.score}%</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link to={`/resumes/${resume._id}/analysis`}>
            <Button variant="secondary" size="sm" icon={<BarChart2 size={13} />}>
              Analyse
            </Button>
          </Link>
          {!resume.isActive && (
            <Button
              variant="outline"
              size="sm"
              icon={<Star size={13} />}
              onClick={() => onActivate(resume._id)}
            >
              Set active
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={13} />}
            className="text-danger-500 hover:text-danger-700 hover:bg-danger-50"
            onClick={() => onDelete(resume._id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

const Resumes = () => {
  const toast = useToast();
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    resumeApi.getUserResumes()
      .then((res) => setResumes(res.data || []))
      .catch(() => toast.error('Failed to load resumes.'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleActivate = async (id) => {
    try {
      await resumeApi.activateResume(id);
      setResumes((prev) => prev.map((r) => ({ ...r, isActive: r._id === id })));
      toast.success('Resume set as active.');
    } catch {
      toast.error('Failed to activate resume.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeApi.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resume deleted.');
    } catch {
      toast.error('Failed to delete resume.');
    }
  };

  const handleUpdateLabel = async (id, label) => {
    try {
      await resumeApi.updateLabel(id, label);
      setResumes((prev) => prev.map((r) => r._id === id ? { ...r, label } : r));
      toast.success('Label updated.');
    } catch {
      toast.error('Failed to update label.');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">My Resumes</h1>
            <p className="page-subtitle">Manage your resume versions and track ATS scores over time.</p>
          </div>
          <Link to="/resumes/upload">
            <Button icon={<Upload size={15} />}>Upload New</Button>
          </Link>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary-500" />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title="No resumes yet"
            description="Upload your first resume to get an ATS score and discover matching jobs."
            action={
              <Link to="/resumes/upload">
                <Button icon={<Upload size={15} />}>Upload Resume</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onActivate={handleActivate}
                onDelete={handleDelete}
                onUpdateLabel={handleUpdateLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resumes;
