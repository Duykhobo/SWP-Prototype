import React from 'react';

interface HeritageBadgeProps {
  variant?: 'gold' | 'forest' | 'success' | 'danger' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const HeritageBadge: React.FC<HeritageBadgeProps> = ({
  variant = 'forest',
  children,
  className = '',
}) => {
  const variantClasses = {
    forest: 'bg-[#E5EDE8] text-[#0B291E] border border-[#0B291E]/20',
    gold: 'bg-[#FBF7EE] text-[#B88E4C] border border-[#E8DCC6]',
    success: 'bg-[#E6F4EA] text-[#059669] border border-[#A7F3D0]',
    danger: 'bg-[#FDF2F2] text-[#D9534F] border border-[#FECACA]',
    neutral: 'bg-[#EFECE6] text-[#66786E] border border-[#DCD9D0]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
