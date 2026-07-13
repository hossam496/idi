import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { socialLinks } from '../config/socialLinks';

/**
 * Reusable social media icons component.
 *
 * Props:
 *   size        — icon pixel size (default 24)
 *   showLabels  — show text labels below icons (default false)
 *   className   — extra class names for the wrapper
 *   variant     — 'brand' (colored hover on light bg) | 'light' (on dark bg)
 */

const ITEMS = [
  { key: 'facebook',  Icon: FaFacebook,  label: 'Facebook',  color: '#1877F2' },
  { key: 'instagram', Icon: FaInstagram, label: 'Instagram', color: '#E1306C' },
  { key: 'tiktok',    Icon: FaTiktok,    label: 'TikTok',    color: '#010101' },
  { key: 'whatsapp',  Icon: FaWhatsapp,  label: 'WhatsApp',  color: '#25D366' },
];

function SocialIcon({ item, size, showLabels, variant }) {
  const [hovered, setHovered] = useState(false);
  const isLight = variant === 'light';
  const href = socialLinks[item.key] || null;
  const isDisabled = !href;

  const wrapperStyle = isLight
    ? {
        backgroundColor: hovered ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        color: '#ffffff',
      }
    : {
        backgroundColor: hovered ? item.color : 'transparent',
        border: `1px solid ${hovered ? item.color : '#E8E8E8'}`,
        color: hovered ? '#ffffff' : '#111C44',
      };

  return (
    <a
      href={isDisabled ? undefined : href}
      target={isDisabled ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={item.label}
      title={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        'flex flex-col items-center gap-1.5 transition-transform duration-200',
        hovered ? 'scale-110' : 'scale-100',
        isDisabled ? 'opacity-40 cursor-default pointer-events-none' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200"
        style={wrapperStyle}
      >
        <item.Icon size={size} />
      </span>

      {showLabels && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-200"
          style={{ color: isLight ? 'rgba(255,255,255,0.75)' : '#555555' }}
        >
          {item.label}
        </span>
      )}
    </a>
  );
}

const SocialLinks = ({ size = 24, showLabels = false, className = '', variant = 'brand' }) => (
  <div className={`flex items-center gap-3 flex-wrap ${className}`}>
    {ITEMS.map((item) => (
      <SocialIcon
        key={item.key}
        item={item}
        size={size}
        showLabels={showLabels}
        variant={variant}
      />
    ))}
  </div>
);

export default SocialLinks;
