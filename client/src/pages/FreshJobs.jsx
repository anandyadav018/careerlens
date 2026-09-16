import { useState, useEffect, useCallback } from 'react';
import { jobApi } from '../api/jobApi';
import JobCard from '../components/jobs/JobCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Zap, Clock } from 'lucide-react';

const TIME_FILTERS = [
  { id: '1h',  label: 'Last 1h' },
  { id: '6h',  label: 'Last 6h' },
  { id: '12h', label: 'Last 12h' },
  { id: '24h', label: 'Last 24h' },
  { id: '3d',  label: 'Last 3 days' },
  { id: '7d',  label: 'Last 7 days' },
];

const WORK_MODE = [
  { id: '',       label: 'All' },
  { id: 'true',   label: 'Remote' },
  { id: 'false',  label: 'On-site' },
];

const FreshJobs = () => {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [filters, setFilters]   = useState({
    postedWithin: '24h',
    isRemote: '',
    experienceLevel: '',
    jobType: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobApi.getJobs(filters);
      // API returns { success, data: [...jobs], pagination: {...} }
      setJobs(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total || 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-success-600" />
          <h1 className="page-title">Fresh Jobs</h1>
        </div>
        <p className="page-subtitle">Recently posted opportunities — act fast.</p>
      </div>

      <div className="p-6 lg:p-8">
        {/* Time filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mr-1">
            <Clock size={13} /> Posted:
          </span>
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setFilter('postedWithin', tf.id)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                filters.postedWithin === tf.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {tf.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            {WORK_MODE.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilter('isRemote', m.id)}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  filters.isRemote === m.id
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-neutral-400 mb-5">
            {total || jobs.length} job{(total || jobs.length) !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Job grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary-500" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Zap size={24} />}
            title="No fresh jobs found"
            description="Try expanding the time window or clearing some filters."
          />
        )}
      </div>
    </div>
  );
};

export default FreshJobs;
