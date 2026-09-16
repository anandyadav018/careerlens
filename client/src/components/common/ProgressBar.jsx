/**
 * ProgressBar — Horizontal progress bar with animated fill.
 *
 * Props:
 *   value     {number} 0–100
 *   color     {'blue'|'green'|'amber'|'red'} default 'blue'
 *   size      {'sm'|'md'|'lg'} default 'md'
 *   animated  {boolean} default true
 *   label     {string|null}
 */

const COLORS = {
  blue:  'bg-primary-500',
  green: 'bg-success-500',
  amber: 'bg-warning-500',
  red:   'bg-danger-500',
};

const HEIGHTS = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3',
};

const getColor = (value, explicit) => {
  if (explicit) return COLORS[explicit] || COLORS.blue;
  if (value >= 80) return COLORS.green;
  if (value >= 60) return COLORS.amber;
  return COLORS.red;
};

const ProgressBar = ({ value = 0, color, size = 'md', animated = true, label }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const fillColor = getColor(clampedValue, color);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-neutral-600">{label}</span>
          <span className="text-xs font-semibold text-neutral-800">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full ${HEIGHTS[size]} bg-neutral-100 rounded-full overflow-hidden`}>
        <div
          className={`${HEIGHTS[size]} ${fillColor} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
