import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import Button from '../components/common/Button';
import { ArrowRight, ArrowLeft, Check, X } from 'lucide-react';

const STEPS = [
  { id: 'roles',       label: 'Target Roles',      desc: 'What kind of jobs are you looking for?' },
  { id: 'skills',      label: 'Your Skills',        desc: 'What technologies and skills do you have?' },
  { id: 'experience',  label: 'Experience Level',   desc: "Where are you in your career?" },
  { id: 'preferences', label: 'Work Preferences',   desc: 'Where and how do you prefer to work?' },
];

const ROLES_SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Product Manager',
  'UI/UX Designer', 'Android Developer', 'iOS Developer', 'Data Analyst',
  'Cloud Engineer', 'QA Engineer', 'Business Analyst', 'Web Developer',
];

const SKILLS_SUGGESTIONS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'TypeScript',
  'C++', 'HTML/CSS', 'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL',
  'Figma', 'Kotlin', 'Swift', 'Go', 'Ruby', 'Spring Boot', 'Flask', 'Next.js',
];

const EXPERIENCE_OPTIONS = [
  { id: 'fresher',  label: 'Fresher',          sub: 'Still in college or recently graduated' },
  { id: '0-1',      label: '0–1 year',         sub: 'Just started my first role' },
  { id: '1-2',      label: '1–2 years',        sub: 'Some professional experience' },
  { id: '2-5',      label: '2–5 years',        sub: 'Mid-level experience' },
  { id: '5+',       label: '5+ years',         sub: 'Senior professional' },
];

const REMOTE_OPTIONS = [
  { id: 'remote',   label: 'Remote',     icon: '🌍' },
  { id: 'hybrid',   label: 'Hybrid',     icon: '🏢' },
  { id: 'onsite',   label: 'On-site',    icon: '🏙️' },
  { id: 'any',      label: 'Any / Open', icon: '✅' },
];

const JOB_TYPE_OPTIONS = ['full-time', 'part-time', 'internship', 'contract', 'freelance'];

const TagInput = ({ tags, onAdd, onRemove, suggestions, placeholder }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  const add = (val) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setInput('');
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="text-primary-400 hover:text-primary-700 flex-shrink-0"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(input); }
            if (e.key === ',')      { e.preventDefault(); add(input); }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          className="form-input"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 max-h-44 overflow-y-auto">
            {filtered.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => add(s)}
                className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {suggestions.filter((s) => !tags.includes(s)).slice(0, 8).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="px-2.5 py-1 border border-neutral-200 rounded-full text-xs text-neutral-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    preferredRoles:    [],
    skills:            [],
    experienceLevel:   '',
    remotePreference:  'any',
    desiredLocations:  [],
    jobType:           ['full-time'],
  });

  const addToArray = (key, value) => {
    setFormData((p) => ({ ...p, [key]: [...p[key], value] }));
  };
  const removeFromArray = (key, value) => {
    setFormData((p) => ({ ...p, [key]: p[key].filter((v) => v !== value) }));
  };
  const toggle = (key, value) => {
    setFormData((p) => {
      const arr = p[key];
      return { ...p, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const isStepValid = () => {
    if (currentStep === 0) return formData.preferredRoles.length > 0;
    if (currentStep === 2) return !!formData.experienceLevel;
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await authApi.completeOnboarding(formData);
      if (res.data?.user) setUser(res.data.user);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => navigate('/dashboard', { replace: true });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-5 py-10">
      {/* Card */}
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-neutral-50">
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < currentStep
                      ? 'bg-success-500 text-white'
                      : i === currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {i < currentStep ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 ${i < currentStep ? 'bg-success-300' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>
          <h1 className="text-xl font-bold text-neutral-900">{STEPS[currentStep].label}</h1>
          <p className="text-sm text-neutral-500 mt-1">{STEPS[currentStep].desc}</p>
        </div>

        {/* Step Content */}
        <div className="px-8 py-6 min-h-[280px]">
          {/* Step 0: Target Roles */}
          {currentStep === 0 && (
            <TagInput
              tags={formData.preferredRoles}
              onAdd={(v) => addToArray('preferredRoles', v)}
              onRemove={(v) => removeFromArray('preferredRoles', v)}
              suggestions={ROLES_SUGGESTIONS}
              placeholder="Type a role and press Enter..."
            />
          )}

          {/* Step 1: Skills */}
          {currentStep === 1 && (
            <TagInput
              tags={formData.skills}
              onAdd={(v) => addToArray('skills', v)}
              onRemove={(v) => removeFromArray('skills', v)}
              suggestions={SKILLS_SUGGESTIONS}
              placeholder="Type a skill and press Enter..."
            />
          )}

          {/* Step 2: Experience */}
          {currentStep === 2 && (
            <div className="space-y-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, experienceLevel: opt.id }))}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    formData.experienceLevel === opt.id
                      ? 'border-primary-400 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <p className="font-semibold text-neutral-800 text-sm">{opt.label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Work Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Remote preference */}
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">Work mode</p>
                <div className="grid grid-cols-2 gap-2">
                  {REMOTE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, remotePreference: opt.id }))}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.remotePreference === opt.id
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job type */}
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">Job type</p>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggle('jobType', type)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium capitalize transition-all ${
                        formData.jobType.includes(type)
                          ? 'border-primary-400 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desired locations */}
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">Preferred cities (optional)</p>
                <TagInput
                  tags={formData.desiredLocations}
                  onAdd={(v) => addToArray('desiredLocations', v)}
                  onRemove={(v) => removeFromArray('desiredLocations', v)}
                  suggestions={['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Remote']}
                  placeholder="Add a city..."
                />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-danger-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-neutral-100 flex items-center justify-between">
          <div>
            {currentStep > 0 ? (
              <Button variant="ghost" size="md" icon={<ArrowLeft size={15} />} onClick={handleBack}>
                Back
              </Button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>

          <div>
            {currentStep < STEPS.length - 1 ? (
              <Button
                size="md"
                icon={<ArrowRight size={15} />}
                iconPosition="right"
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continue
              </Button>
            ) : (
              <Button
                size="md"
                icon={<Check size={15} />}
                isLoading={isSubmitting}
                onClick={handleFinish}
              >
                Finish setup
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-neutral-400">
        Step {currentStep + 1} of {STEPS.length} — You can update these anytime in your profile.
      </p>
    </div>
  );
};

export default Onboarding;
