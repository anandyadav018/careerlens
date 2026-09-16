import { useState } from 'react';
import { applicationApi } from '../../api/applicationApi';
import { MapPin, IndianRupee, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const KanbanBoard = ({ applications, setApplications }) => {
  const [draggedApp, setDraggedApp] = useState(null);

  const columns = [
    { id: 'saved', title: 'Saved' },
    { id: 'applied', title: 'Applied' },
    { id: 'phone_screen', title: 'Phone Screen' },
    { id: 'interview', title: 'Interview' },
    { id: 'offer', title: 'Offer' },
    { id: 'rejected', title: 'Rejected' }
  ];

  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to generate before adding opacity class
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedApp(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    if (!draggedApp || draggedApp.status === targetStatus) return;

    // Optimistic UI update
    const prevApps = [...applications];
    const newApps = applications.map(app => 
      app._id === draggedApp._id ? { ...app, status: targetStatus } : app
    );
    setApplications(newApps);

    try {
      await applicationApi.updateApplicationStatus(draggedApp._id, targetStatus);
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert on failure
      setApplications(prevApps);
      alert('Failed to update application status.');
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Unlisted';
    if (salary.min && salary.max) return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
    if (salary.min) return `₹${salary.min.toLocaleString()}+`;
    return `Up to ₹${salary.max.toLocaleString()}`;
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 pt-4 items-start min-h-[600px]">
      {columns.map(column => (
        <div 
          key={column.id} 
          className="flex-shrink-0 w-80 bg-gray-50 rounded-xl border border-gray-200 flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-gray-900 capitalize">{column.title}</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
              {applications.filter(app => app.status === column.id).length}
            </span>
          </div>

          {/* Cards Container */}
          <div className="p-3 space-y-3 flex-grow min-h-[150px]">
            {applications.filter(app => app.status === column.id).map(app => (
              <div 
                key={app._id}
                draggable
                onDragStart={(e) => handleDragStart(e, app)}
                onDragEnd={handleDragEnd}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-primary-300 transition-colors"
              >
                <div className="mb-2">
                  <Link to={`/jobs/${app.jobId._id}`} className="font-bold text-gray-900 hover:text-primary-600 truncate block">
                    {app.jobId.title}
                  </Link>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 truncate">
                    <Building size={14} /> {app.jobId.company.name}
                  </p>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin size={12} /> {app.jobId.location.isRemote ? 'Remote' : app.jobId.location.city || 'Location unlisted'}
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={12} /> {formatSalary(app.jobId.salary)}
                  </div>
                </div>
                
                {app.status === 'applied' && app.appliedAt && (
                  <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500 text-right">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
