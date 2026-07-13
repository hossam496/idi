import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  id,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
      <div className="relative w-full">
        <input
          id={id}
          type={inputType}
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white text-brand-navy border rounded-xl font-sans text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green ${
            error 
              ? 'border-brand-red focus:ring-brand-red/30 focus:border-brand-red' 
              : 'border-brand-navy/15 hover:border-brand-navy/30 focus:border-brand-green'
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 hover:text-brand-navy/70 transition-colors p-1"
            aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-brand-red font-medium leading-none">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
