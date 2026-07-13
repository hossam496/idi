import React from 'react';

const Skeleton = ({
  variant = 'text',
  width = 'w-full',
  height = 'h-4',
  className = '',
  ...props
}) => {
  const baseStyle = "shimmer rounded";

  const variants = {
    text: "h-4",
    avatar: "h-10 w-10 rounded-full",
    rect: "h-24 rounded-2xl",
  };

  return (
    <div 
      className={`${baseStyle} ${variant === 'text' ? '' : variants[variant]} ${width} ${height} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
