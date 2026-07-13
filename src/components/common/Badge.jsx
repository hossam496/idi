import React from 'react';

const Badge = ({
  children,
  variant = 'navy',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center font-sans font-semibold rounded-full tracking-wide uppercase";
  
  const variants = {
    green: "bg-brand-green/10 text-brand-green border border-brand-green/10",
    red: "bg-brand-red/10 text-brand-red border border-brand-red/10",
    navy: "bg-brand-navy/10 text-brand-navy border border-brand-navy/10",
    gold: "bg-amber-500/10 text-amber-600 border border-amber-500/10",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
