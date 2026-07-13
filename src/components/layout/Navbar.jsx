import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiMessageSquare, FiBookOpen, FiBookmark, FiHome } from 'react-icons/fi';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/home', label: 'Home', icon: <FiHome /> },
    { path: '/chat', label: 'AI Chat', icon: <FiMessageSquare /> },
    { path: '/grammar', label: 'Grammar', icon: <FiBookOpen /> },
    { path: '/vocabulary', label: 'Vocabulary', icon: <FiBookmark /> },
    { path: '/profile', label: 'Profilo', icon: <FiUser /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-brand-surface border-b border-brand-border shadow-soft backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-3 group">
              {/* Refined Italian Arch SVG Logo */}
              <img 
                src="/logo.jpg" 
                alt="IDI Logo" 
                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-brand-border transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight text-brand-navy leading-none">IDI</span>
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#0B8F52]">Istituto Di Italiano</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/5'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-brand-border pl-4">
              <Link to="/profile" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center font-serif text-sm font-semibold border-2 border-brand-green/20 group-hover:border-brand-green/50 transition-colors">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
                </div>
                <div className="flex flex-col align-start text-left">
                  <span className="text-xs font-semibold text-brand-navy group-hover:text-brand-green transition-colors leading-tight">
                    {user?.name || 'Studente'}
                  </span>
                  <span className="text-[10px] text-brand-textSecondary leading-none">Livello A2</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-brand-navy/60 hover:text-brand-red p-2 rounded-full hover:bg-brand-red/5 transition-colors cursor-pointer"
                title="Esci dall'account"
                aria-label="Disconnetti"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggler */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-navy p-2 rounded-lg hover:bg-brand-navy/5 focus:outline-none cursor-pointer"
              aria-label="Attiva menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="md:hidden bg-brand-surface border-b border-brand-border py-4 px-3 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-brand-navy text-white'
                    : 'text-brand-navy/70 hover:text-brand-navy hover:bg-brand-navy/5'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-serif font-bold">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'ST'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-brand-navy">{user?.name || 'Studente'}</span>
                <span className="text-xs text-brand-textSecondary">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-brand-red px-3 py-2 rounded-xl hover:bg-brand-red/5 font-medium text-sm transition-all cursor-pointer"
            >
              <FiLogOut size={16} />
              <span>Esci</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
