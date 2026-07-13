import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-sans font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-brand-green text-white hover:bg-[#097b46] border border-transparent shadow-sm",
    secondary: "bg-brand-navy text-white hover:bg-[#0b122e] border border-transparent shadow-sm",
    outline: "bg-transparent text-brand-navy border border-brand-navy/20 hover:bg-brand-navy/5",
    danger: "bg-brand-red text-white hover:bg-[#b02222] border border-transparent shadow-sm",
    ghost: "bg-transparent text-brand-navy hover:bg-brand-navy/5 border border-transparent",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <motion.button
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Caricamento...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
