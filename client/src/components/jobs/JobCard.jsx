import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Building2, Wifi } from 'lucide-react';

/** Format posted date as a relative string with freshness color */
const formatPostedAt = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return { label: `${diffMins}m ago`, fresh: true };
  if (diffHours < 24) return { label: `${diffHours}h ago`, fresh: true };
  if (diffDays === 1) return { label: 'Yesterday', fresh: false };
  return { label: `${diffDays}d ago`, fresh: false };
};

/** Format INR salary range */
const formatSalary = (salary) => {
  if (!salary || (!salary.min && !salary.max)) return null;
  const fmt = (n) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toLocaleString('en-IN');
  };
  const currency = salary.currency === 'INR' ? '₹' : '$';
  const period = salary.period === 'monthly' ? '/mo' : '/yr';
  if (salary.min && salary.max) return `${currency}${fmt(salary.min)} – ${fmt(salary.max)}${period}`;
  if (salary.min) return `${currency}${fmt(salary.min)}+${period}`;
  return `Up to ${currency}${fmt(salary.max)}${period}`;
};

/** Source label → display name map */
const SOURCE_LABELS = {
  internshala: 'Internshala',
  timesjobs: 'TimesJobs',
  shine: 'Shine',
  indeed_india: 'Indeed India',
  arbeitnow: 'Arbeitnow',
  remoteok: 'RemoteOK',
};

const JobCard = ({ job }) => {
  const { label: timeLabel, fresh } = formatPostedAt(job.postedAt);
  const salaryStr = formatSalary(job.salary);
  const sourceName = SOURCE_LABELS[job.source] || job.source;
  const initials = (job.company?.name || '?').slice(0, 2).toUpperCase();

  // Determine the location string
  const locationParts = [];
  if (job.location?.isRemote) {
    locationParts.push('Remote');
  } else {
    if (job.location?.city) locationParts.push(job.location.city);
    if (job.location?.state) locationParts.push(job.location.state);
  }
  const locationStr = locationParts.join(', ') || 'India';

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="block group"
      aria-label={`${job.title} at ${job.company?.name}`}
    >
      <article className="job-card card-hover">
        {/* Top Row: Logo + Title + Remote Badge */}
        <div className="flex gap-3">
          {/* Company Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 font-bold text-sm">
            {initials}
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
              {job.title}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 size={12} className="text-neutral-400 flex-shrink-0" />
              <p className="text-xs text-neutral-500 truncate">{job.company?.name || 'Unknown Company'}</p>
            </div>
          </div>

          {/* Remote badge */}
          {job.location?.isRemote && (
            <span className="flex-shrink-0 self-start">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-50 border border-success-100 text-success-700 text-[10px] font-semibold">
                <Wifi size={9} />
                Remote
              </span>
            </span>
          )}
        </div>

        {/* Meta row: location, type, salary */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-neutral-400" />
            {locationStr}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={12} className="text-neutral-400" />
            <span className="capitalize">{job.jobType?.replace(/-/g, ' ')}</span>
          </span>
          {salaryStr && (
            <span className="text-success-600 font-medium">{salaryStr}</span>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="skill-tag text-neutral-400">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer: source + posted time */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 mt-auto">
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">
            {sourceName}
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-medium ${fresh ? 'text-success-600' : 'text-neutral-400'}`}>
            <Clock size={11} />
            {timeLabel}
          </span>
        </div>
      </article>
    </Link>
  );
};

export default JobCard;
