
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isDarkMode, toggleDarkMode }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Painel', path: '/', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    { label: 'Novo', path: '/generate', primary: true, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg> },
    { label: 'Arquivo', path: '/history', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
    { label: 'Planos', path: '/pricing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
  ];

  return (
    <>
      {/* Desktop & Tablet Header */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white">lookcerto<span className="text-indigo-600">.com</span></span>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Dark Mode Toggle - Hidden on very small screens to save space */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {isDarkMode ? 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg> : 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              }
            </button>

            {/* Capacity - Desktop only */}
            <div className="hidden md:flex flex-col items-end border-r border-slate-200 dark:border-slate-800 pr-4">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Capacidade</span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-200 leading-none">{user.credits} UN</span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-[80px] md:max-w-[120px]">{user.name}</p>
                <button onClick={onLogout} className="text-[10px] text-red-500 font-bold hover:underline leading-none">SAIR</button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar */}
        <div className="hidden md:flex bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] font-black transition-all uppercase tracking-widest flex items-center ${
                  location.pathname === item.path
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {item.label}
                {item.primary && <span className="ml-2 w-1 h-1 bg-indigo-500 rounded-full animate-ping"></span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 pb-safe">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 transition-all ${
                location.pathname === item.path
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <div className={`${item.primary ? 'bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none -mt-6' : ''}`}>
                {item.icon}
              </div>
              {!item.primary && <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>}
            </Link>
          ))}
          {/* Mobile Logout (Icon only) */}
          <button 
            onClick={onLogout}
            className="flex flex-col items-center space-y-1 text-slate-400 dark:text-slate-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span className="text-[9px] font-black uppercase tracking-tighter">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
