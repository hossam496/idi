import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) => {
  const CardComponent = onClick ? motion.div : 'div';
  
  const motionProps = onClick ? {
    whileHover: hoverEffect ? { y: -4, boxShadow: '0 12px 30px -4px rgba(17, 28, 68, 0.08)' } : {},
    whileTap: { scale: 0.99 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
    onClick: onClick
  } : {};

  return (
    <CardComponent
      className={`bg-brand-surface border border-brand-border rounded-2xl p-6 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${hoverEffect && !onClick ? 'hover:shadow-premiumHover hover:-translate-y-1' : 'shadow-premium'} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;
