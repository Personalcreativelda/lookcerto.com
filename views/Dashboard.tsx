
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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 md:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Kanimambo, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium">O seu experimentador virtual está pronto.</p>
        </div>
        <Link 
          to="/generate" 
          className="bg-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg md:shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center uppercase tracking-widest text-xs md:text-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
          Simular Novo Look
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 md:mb-6">
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Capacidade Restante</h3>
          <p className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mt-1 md:mt-2">{user.credits} <span className="text-xs md:text-sm text-slate-400 font-bold uppercase">Un</span></p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 md:mb-6">
            <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Total Simulado</h3>
          <p className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mt-1 md:mt-2">{history.length}</p>
        </div>

        <div className="bg-indigo-600 dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-indigo-500 dark:border-slate-800 shadow-xl flex flex-col justify-between sm:col-span-2 md:col-span-1 transition-all">
          <div className="flex items-center justify-between md:block">
            <h3 className="text-indigo-200 dark:text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Licença Ativa</h3>
            <p className="text-xl md:text-3xl font-black text-white mt-1 md:mt-2 tracking-tight uppercase">{user.plan}</p>
          </div>
          <Link to="/pricing" className="bg-white/20 dark:bg-slate-800 hover:bg-white/30 dark:hover:bg-slate-700 text-white text-[9px] md:text-[10px] font-black py-3 md:py-4 rounded-lg md:rounded-xl flex items-center justify-center mt-4 md:mt-6 transition-all uppercase tracking-widest">
            Aumentar Plano
            <svg className="w-3 h-3 md:w-4 md:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5-5 5"/></svg>
          </Link>
        </div>
      </div>

      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 md:pb-4">
          <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Recentemente Criados</h2>
          {history.length > 0 && (
            <Link to="/history" className="text-indigo-600 dark:text-indigo-400 hover:underline text-[10px] md:text-sm font-black uppercase tracking-widest">Ver Todos</Link>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 p-10 md:p-16 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Inicie a sua primeira simulação para ver os resultados aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {recent.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={item.imageUrl} alt="Look" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 md:p-4 flex items-center justify-between">
                  <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
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
