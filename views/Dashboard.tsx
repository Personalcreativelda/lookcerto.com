
import React from 'react';
import { Link } from 'react-router-dom';
import { User, MockupResult, PlanType } from '../types';

interface DashboardProps {
  user: User;
  history: MockupResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, history }) => {
  const recent = history.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kanimambo, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">O seu atelier digital de moda internacional está pronto.</p>
        </div>
        <Link 
          to="/generate" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
          Criar Novo Look
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Saldo de Créditos</h3>
          <p className="text-3xl font-bold text-slate-800 mt-1">{user.credits}</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (user.credits / 5) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total de Gerações</h3>
          <p className="text-3xl font-bold text-slate-800 mt-1">{history.length}</p>
          <p className="text-[10px] text-slate-400 mt-2">Pronto para exportação global</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Status da Conta</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{user.plan}</p>
          </div>
          <Link to="/pricing" className="text-indigo-600 text-xs font-bold hover:underline flex items-center mt-4">
            Gerir Subscrição
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Designs Recentes</h2>
          {history.length > 0 && (
            <Link to="/history" className="text-slate-500 hover:text-indigo-600 text-sm font-medium">Histórico Completo</Link>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <h3 className="text-lg font-bold text-slate-800">A sua galeria está vazia</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Transforme as suas peças de roupa em marketing de classe mundial agora.</p>
            <Link to="/generate" className="mt-8 inline-block bg-white text-slate-800 px-6 py-2 rounded-lg font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
              Começar a Gerar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={item.imageUrl} alt="Resultado" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.category}</span>
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
