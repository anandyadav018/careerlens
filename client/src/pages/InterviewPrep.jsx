import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { aiApi } from '../api/aiApi';
import { jobApi } from '../api/jobApi';
import { ArrowLeft, MessageSquare, Code, Cpu } from 'lucide-react';

const InterviewPrep = () => {
  const { id: jobId } = useParams();
  const [job, setJob] = useState(null);
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const jobRes = await jobApi.getJobById(jobId);
        setJob(jobRes.data);

        const aiRes = await aiApi.generateInterviewQuestions(jobId);
        setPrepData(aiRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate interview prep. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [jobId]);

  const getIconForType = (type) => {
    switch(type) {
      case 'technical': return <Code className="text-blue-500" />;
      case 'behavioral': return <MessageSquare className="text-purple-500" />;
      case 'system_design': return <Cpu className="text-orange-500" />;
      default: return <MessageSquare className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex-grow flex flex-col items-center justify-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500 animate-pulse">Analyzing job description and compiling custom interview questions...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !prepData) {
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Mock Interview Guide</h1>
          <p className="text-gray-600">Tailored questions for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company.name}</span></p>
        </div>

        <div className="space-y-6">
          {prepData.questions.map((q, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                {getIconForType(q.type)}
                <span className="font-semibold text-gray-900 uppercase tracking-wide text-sm">{q.type.replace('_', ' ')}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{index + 1}. {q.question}</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Strategy / Hint</h4>
                  <p className="text-sm text-blue-800">{q.hint}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default InterviewPrep;
