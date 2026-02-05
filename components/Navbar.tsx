
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Painel', path: '/' },
    { label: 'Novo Look', path: '/generate', primary: true },
    { label: 'Histórico', path: '/history' },
    { label: 'Planos', path: '/pricing' },
  ];

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-indigo-700 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">lookcerto<span className="text-indigo-600">.com</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.primary 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                    : location.pathname === item.path
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleOpenKey}
            title="Configurar Chave API"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          </button>

          <div className="hidden sm:flex flex-col items-end mr-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Créditos</span>
            <span className="text-sm font-bold text-slate-700">{user.credits}</span>
          </div>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user.name}</p>
              <button onClick={onLogout} className="text-[9px] text-red-500 font-black uppercase tracking-tighter hover:underline">SAIR DA CONTA</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
