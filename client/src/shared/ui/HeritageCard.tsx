import React from 'react';

interface HeritageCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const HeritageCard: React.FC<HeritageCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  className = '',
  children,
  footer,
}) => {
  return (
    <div
      className={`bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}
    >
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-[#DCD9D0] flex items-center justify-between bg-[#FBF7EE]/60">
          <div className="flex items-center gap-3">
            {icon && <div className="text-[#0B291E] p-2 bg-[#E5EDE8] rounded-lg">{icon}</div>}
            <div>
              {title && <h3 className="font-semibold text-lg text-[#0B291E]">{title}</h3>}
              {subtitle && <p className="text-xs text-[#66786E] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-3 border-t border-[#DCD9D0] bg-[#EFECE6]/40 text-xs text-[#66786E]">
          {footer}
        </div>
      )}
    </div>
  );
};
