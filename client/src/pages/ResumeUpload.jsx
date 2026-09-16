import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ResumeUploader from '../components/resume/ResumeUploader';
import { resumeApi } from '../api/resumeApi';

const ResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await resumeApi.uploadResume(file);
      // Redirect to the analysis page for the newly uploaded resume
      navigate(`/resumes/${response.data._id}/analysis`);
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze resume.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upload Your Resume
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Our AI will extract your skills, analyze your experience, and give you an ATS compatibility score in seconds.
          </p>
        </div>

        {error && (
          <div className="mb-6 w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
        
        <div className="mt-16 w-full max-w-4xl border-t border-gray-200 pt-10">
          <h3 className="text-lg font-medium text-gray-900 text-center mb-8">What our AI looks for</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 text-xl mb-4">🤖</div>
              <h4 className="text-base font-medium text-gray-900">ATS Formatting</h4>
              <p className="mt-2 text-sm text-gray-500">Checking for layout issues that confuse applicant tracking systems.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 text-xl mb-4">🎯</div>
              <h4 className="text-base font-medium text-gray-900">Skill Extraction</h4>
              <p className="mt-2 text-sm text-gray-500">Identifying your hard skills, soft skills, tools, and languages.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 text-xl mb-4">📈</div>
              <h4 className="text-base font-medium text-gray-900">Impact Metrics</h4>
              <p className="mt-2 text-sm text-gray-500">Evaluating if your experience bullets show measurable impact.</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResumeUpload;
