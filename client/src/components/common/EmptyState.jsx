/**
 * EmptyState — Reusable empty/null state component.
 *
 * Usage:
 *   <EmptyState
 *     icon={<FileText size={24} />}
 *     title="No resumes yet"
 *     description="Upload your resume to get personalized job matches."
 *     action={<Button onClick={...}>Upload Resume</Button>}
 *   />
 */
const EmptyState = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-icon">
          {icon}
        </div>
      )}
      <p className="empty-title">{title}</p>
      {description && (
        <p className="empty-description">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
