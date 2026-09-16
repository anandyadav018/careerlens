import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import KanbanBoard from '../components/applications/KanbanBoard';
import Spinner from '../components/common/Spinner';
import { applicationApi } from '../api/applicationApi';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationApi.getApplications();
        setApplications(response.data);
      } catch {
        setError('Failed to load your applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500 mt-1">Drag and drop cards to update your application status.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex-grow">
            <KanbanBoard applications={applications} setApplications={setApplications} />
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Applications;
