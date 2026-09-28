import React from 'react';

interface HeritageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const HeritageButton: React.FC<HeritageButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg px-4 py-2.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-[#0B291E] text-[#FAF9F5] hover:bg-[#133E2F] focus:ring-[#0B291E] shadow-xs active:scale-[0.99]',
    gold:
      'bg-[#B88E4C] text-[#FAF9F5] hover:bg-[#A07839] focus:ring-[#B88E4C] shadow-xs active:scale-[0.99]',
    danger:
      'bg-[#D9534F] text-[#FAF9F5] hover:bg-[#C9302C] focus:ring-[#D9534F] shadow-xs active:scale-[0.99]',
    outline:
      'border border-[#DCD9D0] bg-[#FAF9F5] text-[#14241C] hover:bg-[#EFECE6] hover:border-[#B88E4C] focus:ring-[#B88E4C]',
    ghost:
      'text-[#0B291E] hover:bg-[#E5EDE8] focus:ring-[#0B291E]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon && <span className="text-current">{icon}</span>
      )}
      {children}
    </button>
  );
};
