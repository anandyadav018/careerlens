/**
 * ScoreRing — SVG circular progress ring for displaying ATS/resume scores.
 *
 * Props:
 *   score   {number} 0–100
 *   size    {number} SVG size in px (default 120)
 *   stroke  {number} stroke width (default 10)
 *   label   {string} text below the score
 */

const getScoreColor = (score) => {
  if (score >= 80) return { stroke: '#16a34a', text: 'text-green-600', label: 'Excellent' };
  if (score >= 60) return { stroke: '#d97706', text: 'text-amber-600', label: 'Good' };
  return { stroke: '#e11d48', text: 'text-red-600', label: 'Needs work' };
};

const ScoreRing = ({ score = 0, size = 120, stroke = 10, label }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const { stroke: strokeColor, text } = getScoreColor(clampedScore);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-label={`Score: ${clampedScore} out of 100`}
          role="img"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className={`font-bold leading-none ${text}`} style={{ fontSize: size * 0.22 }}>
            {clampedScore}
          </span>
          <span className="text-neutral-400 font-medium" style={{ fontSize: size * 0.1 }}>
            /100
          </span>
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-600">{label}</p>
        </div>
      )}
    </div>
  );
};

export default ScoreRing;
