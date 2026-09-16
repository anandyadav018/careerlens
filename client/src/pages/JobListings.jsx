import { useState, useEffect, useCallback, useRef } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import JobCard from '../components/jobs/JobCard';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { jobApi } from '../api/jobApi';
import { Search, MapPin, SlidersHorizontal, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: '',
    location: '',
    isRemote: '',
    jobType: '',
    experienceLevel: '',
    postedWithin: 'all',
    page: 1,
    limit: 12,
  });

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchJobs = useCallback(async (activeFilters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.getJobs(activeFilters);
      // API response: { success, data: [...jobs], pagination: { page, limit, total, totalPages } }
      setJobs(Array.isArray(res.data) ? res.data : []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.isRemote, filters.jobType, filters.experienceLevel, filters.postedWithin]);

  // Debounce text search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters(f => ({ ...f, q: val, page: 1 }));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs({ ...filters, q: val, page: 1 });
    }, 450);
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    fetchJobs({ ...filters, page: 1 });
  };

  const changePage = (newPage) => {
    setFilters(f => ({ ...f, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({ q: '', location: '', isRemote: '', jobType: '', experienceLevel: '', postedWithin: 'all', page: 1, limit: 12 });
  };

  const activeFilterCount = [
    filters.isRemote, filters.jobType, filters.experienceLevel,
    filters.postedWithin !== 'all' ? filters.postedWithin : '',
  ].filter(Boolean).length;

  return (
    <PageWrapper>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="page-header pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-primary-600" />
                <h1 className="page-title">Job Listings</h1>
              </div>
              <p className="page-subtitle">
                Real opportunities from Indian job boards, updated every 6 hours.
              </p>
            </div>
            {pagination.total > 0 && (
              <span className="text-sm text-neutral-400 mt-1 hidden sm:block">
                {pagination.total} jobs
              </span>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 mt-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={filters.q}
                onChange={handleSearchChange}
                placeholder="Search job title, skills, or company..."
                className="form-input pl-9 pr-3"
                id="job-search-input"
                aria-label="Search jobs"
              />
            </div>
            <div className="relative hidden sm:block">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={filters.location}
                onChange={e => handleFilterChange('location', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="City or Remote"
                className="form-input pl-9 pr-3 w-44"
                aria-label="Filter by location"
              />
            </div>
            <Button type="submit" size="md" className="px-5">
              Search
            </Button>
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </form>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-4 animate-fade-in">
              {/* Job Type */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label mb-0">Job Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {['', 'full-time', 'part-time', 'contract', 'internship'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('jobType', type)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        filters.jobType === type
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {type === '' ? 'All' : type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Setup */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label mb-0">Work Setup</label>
                <div className="flex gap-1.5">
                  {[['', 'Any'], ['true', 'Remote'], ['false', 'On-site']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleFilterChange('isRemote', val)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        filters.isRemote === val
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label mb-0">Experience</label>
                <div className="flex flex-wrap gap-1.5">
                  {[['', 'Any'], ['entry', 'Fresher'], ['mid', 'Mid'], ['senior', 'Senior']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleFilterChange('experienceLevel', val)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        filters.experienceLevel === val
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posted Within */}
              <div className="flex flex-col gap-1.5">
                <label className="form-label mb-0">Posted Within</label>
                <div className="flex flex-wrap gap-1.5">
                  {[['all', 'Any time'], ['24h', '24 hours'], ['3d', '3 days'], ['7d', '7 days']].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => handleFilterChange('postedWithin', val)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        filters.postedWithin === val
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="text-xs text-danger-600 hover:underline font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {error && (
            <div className="bg-danger-50 border border-danger-100 text-danger-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Spinner size="lg" className="text-primary-500" />
              <p className="text-sm text-neutral-400">Fetching fresh jobs from India...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={24} />}
              title="No jobs found"
              description={
                activeFilterCount > 0
                  ? 'Try clearing some filters, or broaden your search.'
                  : 'Jobs are scraped every 6 hours. Check back soon or trigger a manual refresh.'
              }
              action={
                activeFilterCount > 0
                  ? <Button variant="secondary" onClick={clearFilters} size="sm">Clear filters</Button>
                  : null
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
                  <p className="text-sm text-neutral-400">
                    Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} jobs
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={15} />
                      Prev
                    </button>
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default JobListings;
