const SIZES = {
  sm:  'w-4 h-4 border-[1.5px]',
  md:  'w-5 h-5 border-2',
  lg:  'w-8 h-8 border-[3px]',
  xl:  'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <div
      className={`
        ${SIZES[size] || SIZES.md}
        rounded-full
        border-current
        border-t-transparent
        animate-spin
        opacity-80
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
