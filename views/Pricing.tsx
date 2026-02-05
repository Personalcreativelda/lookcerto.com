
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
      name: "Lite",
      price: "0 MT",
      description: "Para iniciantes e entusiastas.",
      features: ["5 Simulações mensais", "Qualidade Padrão", "Uso não-comercial"],
      buttonText: "Plano Atual",
      current: user.plan === PlanType.FREE
    },
    {
      type: PlanType.PRO,
      name: "PRO",
      price: "950 MT",
      period: "/mês",
      description: "Para marcas e e-commerces.",
      features: ["50 Simulações mensais", "Qualidade 4K Ultra", "Uso Comercial Liberado", "Processamento Turbo"],
      buttonText: "Ativar Licença",
      highlight: true,
      current: user.plan === PlanType.PRO
    },
    {
      type: PlanType.ENTERPRISE,
      name: "Custom",
      price: "3.500 MT",
      period: "/mês",
      description: "Para grandes catálogos e franquias.",
      features: ["Capacidade Ilimitada", "API Dedicada", "Caimento Avançado", "Suporte 24/7 VIP"],
      buttonText: "Falar c/ Consultor",
      current: user.plan === PlanType.ENTERPRISE
    }
  ];

  return (
    <div className="space-y-8 md:space-y-16 py-4 md:py-8 animate-in fade-in duration-500 pb-24 md:pb-0 px-4 md:px-0">
      <header className="text-center space-y-2 md:space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Planos de Simulação</h1>
        <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Potencialize a conversão da sua loja digital.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch justify-center">
        {plans.map((plan) => (
          <div 
            key={plan.type} 
            className={`relative flex flex-col p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 w-full lg:max-w-sm ${
              plan.highlight 
                ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xl lg:scale-105 z-10' 
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                Recomendado
              </div>
            )}

            <div className="mb-6 md:mb-10 text-center">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{plan.name}</h3>
              <div className="mt-4 md:mt-6 flex items-baseline justify-center">
                <span className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="ml-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{plan.period}</span>}
              </div>
              <p className="mt-3 md:mt-6 text-slate-500 text-xs md:text-sm font-medium leading-relaxed">{plan.description}</p>
            </div>

            <ul className="mb-8 md:mb-10 space-y-4 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-[11px] md:text-sm text-slate-600 dark:text-slate-300 font-semibold">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-2 h-2 md:w-3 md:h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => !plan.current && onUpgrade(plan.type)}
              disabled={plan.current}
              className={`w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs transition-all uppercase tracking-widest ${
                plan.current
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                  : plan.highlight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-95'
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
