import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import SkillTag from '../components/resume/SkillTag';
import { jobApi } from '../api/jobApi';
import { applicationApi } from '../api/applicationApi';
import { MapPin, Briefcase, Clock, IndianRupee, ArrowLeft, Building, ExternalLink, Zap, FileText, MessageSquare, Check } from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [jobSaved, setJobSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobApi.getJobById(id);
        setJob(response.data);
      } catch {
        setError('Failed to load job details. The posting may have expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleGetMatchScore = async () => {
    setScoring(true);
    try {
      const response = await jobApi.getJobMatchScore(id);
      setMatchScore(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setScoring(false);
    }
  };

  const handleSaveJob = async () => {
    setSavingJob(true);
    try {
      await applicationApi.saveApplication(id, 'saved');
      setJobSaved(true);
    } catch (err) {
      if (err.response?.data?.message?.includes('already saved')) {
        setJobSaved(true);
      } else {
        alert(err.response?.data?.message || 'Failed to save job');
      }
    } finally {
      setSavingJob(false);
    }
  };

  if (loading) return <PageWrapper><div className="flex-grow flex items-center justify-center"><Spinner size="lg" /></div></PageWrapper>;
  
  if (error || !job) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
          <Link to="/jobs"><Button>Back to Jobs</Button></Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Link to="/jobs" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-6">
            <ArrowLeft size={16} /> Back to Search
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-center gap-6">
              {job.company.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-20 h-20 rounded-lg border border-gray-200 object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-3xl font-bold border border-gray-200">
                  {job.company.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
                <div className="flex items-center gap-2 text-lg text-gray-600">
                  <Building size={20} />
                  <span className="font-medium">{job.company.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => window.open(job.sourceUrl, '_blank')}>
                View Original <ExternalLink size={16} className="ml-2" />
              </Button>
              <Button 
                variant={jobSaved ? 'secondary' : 'primary'} 
                className="flex-1 md:flex-none flex items-center gap-2"
                onClick={handleSaveJob}
                disabled={jobSaved || savingJob}
              >
                {savingJob ? 'Saving...' : jobSaved ? <><Check size={16} /> Saved</> : 'Save Job'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-8 py-4 border-t border-gray-100 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-400" />
              <span>{job.location.isRemote ? 'Remote' : `${job.location.city}, ${job.location.state}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="text-gray-400" />
              <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="text-gray-400" />
              <span>{
                job.salary.min && job.salary.max 
                  ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` 
                  : job.salary.min 
                    ? `₹${job.salary.min.toLocaleString()}+` 
                    : job.salary.max
                      ? `Up to ₹${job.salary.max.toLocaleString()}`
                      : 'Unlisted'
              }</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" />
              <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {job.description}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Smart Match AI Widget */}
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-200 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Zap size={64} className="text-primary-500" />
            </div>
            
            <h3 className="font-bold text-gray-900 mb-2 relative z-10">AI Smart Match</h3>
            
            {!matchScore && !scoring && (
              <div className="relative z-10">
                <p className="text-sm text-gray-600 mb-4">Calculate how well your active resume matches this job description.</p>
                <Button onClick={handleGetMatchScore} className="w-full">Calculate Match Score</Button>
              </div>
            )}
            
            {scoring && (
              <div className="flex flex-col items-center py-4 relative z-10">
                <Spinner />
                <p className="text-sm text-gray-500 mt-2">Analyzing match...</p>
              </div>
            )}
            
            {matchScore && (
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-4xl font-bold ${matchScore.matchScore >= 80 ? 'text-green-600' : matchScore.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {matchScore.matchScore}
                  </span>
                  <span className="text-gray-500 mb-1">/ 100</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-green-700 uppercase mb-1">Matched Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {matchScore.matchedSkills.map(s => <span key={s} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-700 uppercase mb-1">Missing Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {matchScore.missingSkills.map(s => <span key={s} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{s}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Tools Widget */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">AI Tools</h3>
            <div className="space-y-3">
              <Link to={`/jobs/${id}/cover-letter`} className="block">
                <Button variant="secondary" className="w-full flex justify-start items-center gap-2">
                  <FileText size={18} className="text-primary-600" />
                  Generate Cover Letter
                </Button>
              </Link>
              <Link to={`/jobs/${id}/interview-prep`} className="block">
                <Button variant="secondary" className="w-full flex justify-start items-center gap-2">
                  <MessageSquare size={18} className="text-primary-600" />
                  Mock Interview Questions
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <SkillTag key={skill} skill={skill} category="default" />
              ))}
              {job.skills.length === 0 && <span className="text-gray-500 text-sm">No specific skills listed.</span>}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default JobDetail;
