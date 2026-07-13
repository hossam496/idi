import React from 'react';
import { FiSearch } from 'react-icons/fi';

const Search = ({
  value,
  onChange,
  placeholder = 'Cerca...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy transition-all"
        {...props}
      />
    </div>
  );
};

export default Search;
