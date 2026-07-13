import React from 'react';

const SectionTitle = ({
  title,
  subtitle,
  badge,
  className = '',
  align = 'center',
}) => {
  const alignments = {
    center: 'text-center',
    left: 'text-left',
  };

  return (
    <div className={`space-y-3 ${alignments[align]} ${className}`}>
      {badge && (
        <span className="inline-block bg-brand-green/10 text-brand-green text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-brand-green/10">
          {badge}
        </span>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-brand-textSecondary max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={`h-1 w-16 bg-brand-green rounded ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  );
};

export default SectionTitle;
