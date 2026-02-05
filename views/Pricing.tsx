
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
      description: "Experimente a nossa IA sem custos.",
      features: [
        "5 Mockups por mês",
        "Qualidade Padrão",
        "Suporte Global",
      ],
      buttonText: "Plano Atual",
      current: user.plan === PlanType.FREE
    },
    {
      type: PlanType.PRO,
      name: "Profissional",
      price: "950 MT",
      period: "/mês",
      description: "Ideal para lojas de moda e criadores digitais.",
      features: [
        "50 Mockups por mês",
        "Exportação HD",
        "Uso Comercial Internacional",
        "Processamento Prioritário",
        "Remoção de marca d'água"
      ],
      buttonText: "Assinar Pro",
      highlight: true,
      current: user.plan === PlanType.PRO
    },
    {
      type: PlanType.ENTERPRISE,
      name: "Enterprise",
      price: "3.500 MT",
      period: "/mês",
      description: "Para grandes marcas e produção em escala global.",
      features: [
        "Gerações Ilimitadas",
        "Acesso via API",
        "Treinamento de Modelo Customizado",
        "Qualidade 4K Ultra",
        "Suporte 24/7 Dedicado",
      ],
      buttonText: "Contactar Vendas",
      current: user.plan === PlanType.ENTERPRISE
    }
  ];

  return (
    <div className="space-y-12 py-8 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Planos Flexíveis</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Eleve o seu e-commerce em Moçambique e no mundo com IA de ponta.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.type} 
            className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 ${
              plan.highlight 
                ? 'border-indigo-600 bg-white shadow-2xl scale-105 z-10' 
                : 'border-slate-200 bg-white shadow-sm hover:shadow-lg'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                RECOMENDADO
              </div>
            )}

            <div className="mb-8 text-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{plan.name}</h3>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-4xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                {plan.period && <span className="ml-1 text-slate-400 font-bold">{plan.period}</span>}
              </div>
              <p className="mt-4 text-slate-400 text-sm font-medium leading-relaxed">{plan.description}</p>
            </div>

            <ul className="mb-8 space-y-4 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => !plan.current && onUpgrade(plan.type)}
              disabled={plan.current}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all uppercase tracking-widest ${
                plan.current
                  ? 'bg-slate-50 text-slate-300 cursor-default'
                  : plan.highlight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'
                  : 'bg-slate-900 text-white hover:bg-black active:scale-95'
              }`}
            >
              {plan.current ? "Plano Ativo" : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
        <h2 className="text-3xl font-black relative z-10 tracking-tight">Presença Internacional</h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto relative z-10 font-medium">
          Aceitamos pagamentos via M-Pesa, Cartões Internacionais e Cripto para garantir que a sua marca não tenha fronteiras.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 relative z-10">
           <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-indigo-300">M-Pesa</span>
           <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-indigo-300">Visa / Master</span>
           <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10 uppercase tracking-widest text-indigo-300">PayPal</span>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
