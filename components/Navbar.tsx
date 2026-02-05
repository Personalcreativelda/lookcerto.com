
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
    { label: 'Painel', path: '/' },
    { label: 'Novo Look', path: '/generate', primary: true },
    { label: 'Histórico', path: '/history' },
    { label: 'Licenciamento', path: '/pricing' },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      {/* Top Layer: Branding & User Controls */}
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">lookcerto<span className="text-indigo-600">.com</span></span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${!isDarkMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
            </button>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-400'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            </button>
          </div>

          <div className="hidden sm:flex flex-col items-end border-r border-slate-200 dark:border-slate-800 pr-4">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Capacidade</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 leading-none">{user.credits} UN</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-[100px]">{user.name}</p>
              <button onClick={onLogout} className="text-[10px] text-red-500 font-bold hover:underline leading-none">SAIR</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layer: Navigation Toolbar */}
      <div className="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-center space-x-1 md:space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest flex items-center border ${
                location.pathname === item.path
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
              {item.primary && (
                <span className="ml-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
