const SkillTag = ({ skill, category }) => {
  const categoryStyles = {
    technical: 'bg-blue-100 text-blue-800 border-blue-200',
    soft: 'bg-green-100 text-green-800 border-green-200',
    tools: 'bg-purple-100 text-purple-800 border-purple-200',
    languages: 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const style = categoryStyles[category] || categoryStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} shadow-sm`}>
      {skill}
    </span>
  );
};

export default SkillTag;
