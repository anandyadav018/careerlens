import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { aiApi } from '../api/aiApi';
import { jobApi } from '../api/jobApi';
import { ArrowLeft, Copy, CheckCircle, Download } from 'lucide-react';

const CoverLetter = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generate = async () => {
      try {
        const jobRes = await jobApi.getJobById(jobId);
        setJob(jobRes.data);

        const aiRes = await aiApi.generateCoverLetter(jobId);
        setCoverLetter(aiRes.data.coverLetter);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate cover letter. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [jobId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${job?.company?.name?.replace(/\\s+/g, '_') || 'Job'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500 animate-pulse">Our AI is writing your tailored cover letter...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !coverLetter) {
    return (
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
          <Link to={`/jobs/${jobId}`}><Button>Back to Job Details</Button></Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link to={`/jobs/${jobId}`} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-6">
          <ArrowLeft size={16} /> Back to Job Details
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">AI Cover Letter</h1>
            <p className="text-gray-600">Tailored for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company.name}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy} className="flex items-center gap-2">
              {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            <Button variant="primary" onClick={handleDownload} className="flex items-center gap-2">
              <Download size={16} /> Download
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 font-serif text-gray-800 leading-relaxed whitespace-pre-wrap">
          {coverLetter}
        </div>
      </div>
    </PageWrapper>
  );
};

export default CoverLetter;
