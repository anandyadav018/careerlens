import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import { User, Mail, MapPin, Briefcase, Code, Save, Edit2 } from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { id: '',       label: 'Not set' },
  { id: 'fresher', label: 'Fresher' },
  { id: '0-1',    label: '0–1 year' },
  { id: '1-2',    label: '1–2 years' },
  { id: '2-5',    label: '2–5 years' },
  { id: '5+',     label: '5+ years' },
];

const REMOTE_PREF = ['any', 'remote', 'hybrid', 'onsite'];
const JOB_TYPES   = ['full-time', 'part-time', 'internship', 'contract', 'freelance'];

const getCompletion = (user) => {
  const checks = [
    user?.firstName,
    user?.lastName,
    user?.email,
    user?.headline,
    user?.location?.city,
    user?.skills?.length > 0,
    user?.experienceLevel,
    user?.preferredRoles?.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const TagList = ({ tags, onRemove, onAdd, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setInput('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {tags.map((t) => (
          <span key={t} className="skill-tag flex items-center gap-1.5">
            {t}
            <button onClick={() => onRemove(t)} className="text-neutral-400 hover:text-neutral-700 text-xs leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="form-input flex-1 h-9"
        />
        <Button variant="secondary" size="sm" onClick={add}>Add</Button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    firstName:        user?.firstName     || '',
    lastName:         user?.lastName      || '',
    headline:         user?.headline      || '',
    skills:           user?.skills        || [],
    preferredRoles:   user?.preferredRoles || [],
    experienceLevel:  user?.experienceLevel || '',
    'location.city':  user?.location?.city  || '',
    'preferences.remotePreference': user?.preferences?.remotePreference || 'any',
    'preferences.jobType':          user?.preferences?.jobType          || [],
  });

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleJobType = (type) => {
    setForm((f) => {
      const arr = f['preferences.jobType'];
      return { ...f, 'preferences.jobType': arr.includes(type) ? arr.filter((t) => t !== type) : [...arr, type] };
    });
  };

  const completion = getCompletion(user);
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        firstName:       form.firstName,
        lastName:        form.lastName,
        headline:        form.headline,
        skills:          form.skills,
        preferredRoles:  form.preferredRoles,
        experienceLevel: form.experienceLevel,
        location:        { city: form['location.city'] },
        preferences: {
          remotePreference: form['preferences.remotePreference'],
          jobType:          form['preferences.jobType'],
        },
      };
      const res = await authApi.updateProfile(payload);
      setUser(res.data?.user);
      setEditing(false);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header pb-5">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your professional profile and job preferences.</p>
      </div>

      <div className="p-6 lg:p-8 max-w-3xl space-y-5">
        {/* Profile header */}
        <div className="card p-6 flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            {/* Completion ring */}
            <svg className="absolute -inset-1 w-[72px] h-[72px] -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="32" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="36" cy="36" r="32" fill="none" stroke="#2563eb" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - completion / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-neutral-900 text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-neutral-400">{user?.email}</p>
            {user?.headline && <p className="text-sm text-neutral-600 mt-1 italic">"{user.headline}"</p>}
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-32 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${completion}%` }} />
              </div>
              <span className="text-xs text-neutral-400">{completion}% complete</span>
            </div>
          </div>
          <Button
            variant={editing ? 'danger' : 'secondary'}
            size="sm"
            icon={editing ? null : <Edit2 size={13} />}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="card-title flex items-center gap-2">
            <User size={15} className="text-neutral-400" /> Basic Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <div>
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Headline</label>
                  <input className="form-input" value={form.headline} onChange={(e) => setField('headline', e.target.value)} placeholder="e.g. Frontend Developer seeking full-time roles" />
                </div>
                <div>
                  <label className="form-label flex items-center gap-1"><MapPin size={12} /> City</label>
                  <input className="form-input" value={form['location.city']} onChange={(e) => setField('location.city', e.target.value)} placeholder="e.g. Bengaluru" />
                </div>
              </>
            ) : (
              <>
                <InfoField label="Name"     value={`${user?.firstName} ${user?.lastName}`} />
                <InfoField label="Email"    value={user?.email} icon={<Mail size={13} />} />
                <InfoField label="Headline" value={user?.headline || '—'} span />
                <InfoField label="Location" value={user?.location?.city || '—'} icon={<MapPin size={13} />} />
              </>
            )}
          </div>
        </div>

        {/* Experience & Skills */}
        <div className="card p-5 space-y-4">
          <h2 className="card-title flex items-center gap-2">
            <Briefcase size={15} className="text-neutral-400" /> Experience & Skills
          </h2>
          {editing ? (
            <>
              <div>
                <label className="form-label">Experience Level</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setField('experienceLevel', id)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        form.experienceLevel === id
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Skills</label>
                <TagList
                  tags={form.skills}
                  onAdd={(v) => setField('skills', [...form.skills, v])}
                  onRemove={(v) => setField('skills', form.skills.filter((s) => s !== v))}
                  placeholder="Add a skill..."
                />
              </div>
              <div>
                <label className="form-label">Target Roles</label>
                <TagList
                  tags={form.preferredRoles}
                  onAdd={(v) => setField('preferredRoles', [...form.preferredRoles, v])}
                  onRemove={(v) => setField('preferredRoles', form.preferredRoles.filter((r) => r !== v))}
                  placeholder="Add a target role..."
                />
              </div>
            </>
          ) : (
            <>
              <InfoField label="Experience Level" value={EXPERIENCE_LEVELS.find((e) => e.id === user?.experienceLevel)?.label || '—'} />
              <div>
                <p className="text-xs text-neutral-400 mb-1.5 font-medium">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.skills || []).length > 0
                    ? user.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)
                    : <span className="text-sm text-neutral-400">None added</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1.5 font-medium">Target Roles</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.preferredRoles || []).length > 0
                    ? user.preferredRoles.map((r) => <span key={r} className="skill-tag technical">{r}</span>)
                    : <span className="text-sm text-neutral-400">None added</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Job Preferences */}
        <div className="card p-5 space-y-4">
          <h2 className="card-title flex items-center gap-2">
            <Code size={15} className="text-neutral-400" /> Job Preferences
          </h2>
          {editing ? (
            <>
              <div>
                <label className="form-label">Work Mode</label>
                <div className="flex flex-wrap gap-2">
                  {REMOTE_PREF.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setField('preferences.remotePreference', p)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium capitalize transition-all ${
                        form['preferences.remotePreference'] === p
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleJobType(t)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium capitalize transition-all ${
                        form['preferences.jobType'].includes(t)
                          ? 'bg-primary-50 text-primary-700 border-primary-400'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <InfoField label="Work Mode" value={user?.preferences?.remotePreference || 'Any'} />
              <div>
                <p className="text-xs text-neutral-400 mb-1.5 font-medium">Job Type</p>
                <div className="flex flex-wrap gap-2">
                  {(user?.preferences?.jobType || []).length > 0
                    ? user.preferences.jobType.map((t) => <span key={t} className="skill-tag capitalize">{t}</span>)
                    : <span className="text-sm text-neutral-400">Not set</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save button */}
        {editing && (
          <div className="flex justify-end">
            <Button
              isLoading={saving}
              onClick={handleSave}
              icon={<Save size={14} />}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoField = ({ label, value, icon, span }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <p className="text-xs text-neutral-400 mb-0.5 font-medium flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm font-medium text-neutral-800">{value}</p>
  </div>
);

export default Profile;
