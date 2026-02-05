
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, PlanType } from '../types';

interface SignupProps {
  onLogin: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    setLoading(true);

    // Simulação de INSERT no banco de dados (schema.sql -> users table)
    setTimeout(() => {
      onLogin({
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        plan: PlanType.FREE,
        credits: 5
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Criar Conta</h2>
          <p className="mt-2 text-slate-500 font-medium italic">Comece a revolucionar a sua marca hoje</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 sm:text-sm"
              placeholder="Ex: João Mavila"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input
              type="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 sm:text-sm"
              placeholder="empresa@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 sm:text-sm"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input required id="terms" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded" />
            <label htmlFor="terms" className="ml-2 block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Aceito os <a href="#" className="text-indigo-600 underline">Termos e Condições</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-black transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? 'A criar conta...' : 'Criar minha conta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 font-medium">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-tighter text-xs">Entrar agora</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
