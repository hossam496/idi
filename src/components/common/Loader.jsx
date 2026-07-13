import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Caricamento">
      <div
        className={`${sizes[size]} border-brand-green border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
