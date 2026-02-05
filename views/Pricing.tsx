
import React from 'react';
import { PlanType, User } from '../types';

interface PricingProps {
  user: User;
  onUpgrade: (plan: PlanType) => void;
}

const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  const plans = [
    {
      type: PlanType.FREE,
      name: "Iniciante",
      price: "0 MT",
      description: "Ideal para testar a nossa tecnologia de prova virtual.",
      features: [
        "5 Simulações mensais",
        "Qualidade Padrão",
        "Exportação via Web",
      ],
      buttonText: "Plano Atual",
      current: user.plan === PlanType.FREE
    },
    {
      type: PlanType.PRO,
      name: "Profissional",
      price: "950 MT",
      period: "/mês",
      description: "Ideal para lojistas de moda e e-commerces em crescimento.",
      features: [
        "50 Simulações mensais",
        "Qualidade HD Avançada",
        "Uso Comercial Autorizado",
        "Processamento Prioritário",
        "Sem marcas d'água"
      ],
      buttonText: "Ativar Licença Pro",
      highlight: true,
      current: user.plan === PlanType.PRO
    },
    {
      type: PlanType.ENTERPRISE,
      name: "Enterprise",
      price: "3.500 MT",
      period: "/mês",
      description: "Simulação em massa para grandes catálogos e franquias.",
      features: [
        "Capacidade Ilimitada",
        "Suporte a API Customizada",
        "Caimento Especializado",
        "Exportação em 4K Ultra",
        "Suporte Técnico Prioritário",
      ],
      buttonText: "Contactar Consultor",
      current: user.plan === PlanType.ENTERPRISE
    }
  ];

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Escolha seu Plano de Simulação</h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Revolucione a forma como seus clientes compram moda.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div 
            key={plan.type} 
            className={`relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 ${
              plan.highlight 
                ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] scale-105 z-10' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                Mais Popular
              </div>
            )}

            <div className="mb-10 text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
              <div className="mt-6 flex items-baseline justify-center">
                <span className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="ml-1 text-slate-400 dark:text-slate-500 font-bold uppercase text-xs tracking-widest">{plan.period}</span>}
              </div>
              <p className="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{plan.description}</p>
            </div>

            <ul className="mb-10 space-y-5 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300 font-semibold">
                  <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => !plan.current && onUpgrade(plan.type)}
              disabled={plan.current}
              className={`w-full py-5 rounded-[1.5rem] font-black text-xs transition-all uppercase tracking-widest active:scale-95 ${
                plan.current
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-default'
                  : plan.highlight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100'
              }`}
            >
              {plan.current ? "Plano Ativo" : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
