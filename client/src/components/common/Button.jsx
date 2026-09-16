import Spinner from './Spinner';

/**
 * Button — Design system button component.
 *
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes:    sm | md | lg
 */

const VARIANTS = {
  primary: `
    bg-primary-600 text-white border-primary-600
    hover:bg-primary-700 hover:border-primary-700
    active:bg-primary-800
    focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1
  `,
  secondary: `
    bg-white text-neutral-700 border-neutral-200
    hover:bg-neutral-50 hover:border-neutral-300
    active:bg-neutral-100
    focus-visible:ring-2 focus-visible:ring-neutral-300
  `,
  ghost: `
    bg-transparent text-neutral-600 border-transparent
    hover:bg-neutral-100 hover:text-neutral-900
    active:bg-neutral-200
  `,
  danger: `
    bg-danger-600 text-white border-danger-600
    hover:bg-danger-700 hover:border-danger-700
    active:bg-danger-800
    focus-visible:ring-2 focus-visible:ring-danger-400 focus-visible:ring-offset-1
  `,
  outline: `
    bg-transparent text-primary-600 border-primary-300
    hover:bg-primary-50 hover:border-primary-400
    active:bg-primary-100
  `,
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-5 text-[0.9375rem] gap-2 rounded-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  onClick,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        btn inline-flex items-center justify-center font-medium border transition-all
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-neutral-600'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
