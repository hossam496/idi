import React from 'react';

const Textarea = React.forwardRef(({
  label,
  error,
  id,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-xs font-medium text-brand-navy/80 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-2.5 bg-white text-brand-navy border rounded-xl font-sans text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green resize-y ${
          error 
            ? 'border-brand-red focus:ring-brand-red/30 focus:border-brand-red' 
            : 'border-brand-navy/15 hover:border-brand-navy/30 focus:border-brand-green'
        }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-brand-red font-medium leading-none">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
