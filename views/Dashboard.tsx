
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kanimambo, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">O seu experimentador virtual está calibrado e pronto.</p>
        </div>
        <Link 
          to="/generate" 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center uppercase tracking-widest text-sm"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          Simular Novo Look
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Unidades de Simulação</h3>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-2">{user.credits} <span className="text-sm text-slate-400 font-bold">UN</span></p>
          <div className="mt-6 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-glow" 
              style={{ width: `${Math.min(100, (user.credits / 10) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Total de Looks</h3>
          <p className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-2">{history.length}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-3 uppercase tracking-tighter">Renderização Digital 4K</p>
        </div>

        {/* Card dinâmico: Indigo no modo claro, Slate-900 no modo escuro */}
        <div className="bg-indigo-600 dark:bg-slate-900 p-8 rounded-[2rem] border border-indigo-500 dark:border-slate-800 shadow-xl flex flex-col justify-between group transition-all hover:scale-[1.02]">
          <div>
            <h3 className="text-indigo-200 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Licença Ativa</h3>
            <p className="text-3xl font-black text-white mt-2 tracking-tight uppercase">{user.plan}</p>
          </div>
          <Link to="/pricing" className="bg-white/20 dark:bg-slate-800 hover:bg-white/30 dark:hover:bg-slate-700 text-white text-[10px] font-black py-4 rounded-xl flex items-center justify-center mt-6 transition-all uppercase tracking-widest">
            Aumentar Plano
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5-5 5M6 7l5 5-5 5"/></svg>
          </Link>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Portfólio de Simulações</h2>
          {history.length > 0 && (
            <Link to="/history" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-black uppercase tracking-widest">Ver Arquivo Completo</Link>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-16 text-center transition-colors">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Galeria Vazia</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 font-medium">Capture imagens de clientes e produtos para iniciar a simulação.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recent.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl dark:hover:shadow-indigo-900/10 transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={item.imageUrl} alt="Resultado" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter text-slate-800 dark:text-white border border-white/20">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
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
