
import React, { useState } from 'react';
import { MockupResult } from '../types';

interface HistoryProps {
  history: MockupResult[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const [filter, setFilter] = useState('Todos');
  const categories = ['Todos', ...new Set(history.map(h => h.category))];

  const filtered = filter === 'Todos' 
    ? history 
    : history.filter(h => h.category === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Histórico de Criações</h1>
          <p className="text-slate-500">Aceda e descarregue as suas gerações anteriores.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
          <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <h3 className="text-xl font-bold text-slate-800">Nenhuma criação encontrada</h3>
          <p className="text-slate-500 mt-2">Ajuste os seus filtros ou crie o seu primeiro look.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="aspect-[3/4] overflow-hidden relative">
                <img src={item.imageUrl} alt="Resultado" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="w-full flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-widest">{item.category}</span>
                    <a href={item.imageUrl} download className="bg-white text-slate-900 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-bold text-slate-800">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">{item.category} • HD Quality</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
