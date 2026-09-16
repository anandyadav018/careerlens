const ScoreCard = ({ score, title, description, maxScore = 100 }) => {
  // Determine color based on score
  const getScoreColor = (value) => {
    if (value >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (value >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreTextColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-6">
      <div className={`shrink-0 flex items-center justify-center w-20 h-20 rounded-full border-4 ${getScoreColor(score)}`}>
        <div className="flex items-baseline">
          <span className={`text-2xl font-bold ${getScoreTextColor(score)}`}>
            {score}
          </span>
          {maxScore !== 100 && (
            <span className="text-xs font-medium text-gray-400">/{maxScore}</span>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default ScoreCard;
