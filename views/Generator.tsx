
import React, { useState, useEffect, useRef } from 'react';
import { User, Category, MockupResult } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface GeneratorProps {
  user: User;
  onSuccess: (result: MockupResult) => void;
}

const Generator: React.FC<GeneratorProps> = ({ user, onSuccess }) => {
  const [personImg, setPersonImg] = useState<string | null>(null);
  const [productImg, setProductImg] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>(Category.AUTO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingInterval = useRef<number | null>(null);

  const steps = [
    "Analisando biotipo e pose...",
    "Isolando peça de vestuário...",
    "Ajustando física do tecido...",
    "Renderizando sombras de contato...",
    "Sintetizando iluminação global..."
  ];

  useEffect(() => {
    return () => {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    };
  }, []);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024; // Tamanho ideal para Gemini 2.5 Flash
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      if (type === 'person') setPersonImg(compressed);
      else setProductImg(compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!personImg || !productImg) return;
    if (user.credits <= 0) {
      setError("Créditos insuficientes. Por favor, atualize seu plano.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    
    loadingInterval.current = window.setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2000);

    try {
      const base64Result = await geminiService.generateMockup(personImg, productImg, category);
      
      // Upload opcional (S3/MinIO) ou retorno do base64
      const finalUrl = await storageService.uploadBase64Image(base64Result, `look_${Date.now()}`);

      const mockup: MockupResult = {
        id: `m_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: finalUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Virtual Try-On ${category} Professional Synthesis`
      };

      setResult(finalUrl);
      onSuccess(mockup);
      
      // Feedback tátil/visual
      if (window.navigator.vibrate) window.navigator.vibrate(50);
      
    } catch (err: any) {
      setError(err.message || "Erro de renderização. Tente fotos mais claras.");
    } finally {
      setIsGenerating(false);
      if (loadingInterval.current) {
        clearInterval(loadingInterval.current);
        loadingInterval.current = null;
      }
    }
  };

  const reset = () => {
    setPersonImg(null);
    setProductImg(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Motor de <span className="text-indigo-600">Síntese v4.6</span>
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Provador Digital de Alta Fidelidade</p>
        </div>
        {(personImg || result) && (
          <button 
            onClick={reset} 
            className="group flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Reiniciar Studio</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-5 rounded-3xl flex items-center justify-between text-red-600 dark:text-red-400 text-sm font-bold shadow-xl animate-in slide-in-from-top-4">
          <p className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            {error}
          </p>
          <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-xl transition-colors">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controles Laterais */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-center">A Base</span>
                <div className={`aspect-[3/4] border-2 border-dashed rounded-[2rem] overflow-hidden relative transition-all group ${personImg ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300'}`}>
                  <input type="file" onChange={e => handleFileUpload(e, 'person')} className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" />
                  {personImg ? (
                    <img src={personImg} className="w-full h-full object-cover" alt="Modelo" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 p-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">Foto da Pessoa</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-center">O Item</span>
                <div className={`aspect-[3/4] border-2 border-dashed rounded-[2rem] overflow-hidden relative transition-all group ${productImg ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300'}`}>
                  <input type="file" onChange={e => handleFileUpload(e, 'product')} className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" />
                  {productImg ? (
                    <img src={productImg} className="w-full h-full object-cover" alt="Peça" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 p-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">Foto da Roupa</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-1">Tipo de Encaixe</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-slate-700 dark:text-slate-200"
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !personImg || !productImg}
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl ${
                isGenerating 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200 dark:shadow-none'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-3 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                  Sintetizando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Simular Caimento HD
                </>
              )}
            </button>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-4">
             <div className="w-10 h-10 bg-white dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
             </div>
             <div>
               <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">Dica Pro</h4>
               <p className="text-[10px] text-emerald-700/70 dark:text-emerald-500/70 font-bold leading-relaxed">
                 Use fotos de frente sem as mãos na frente do tronco para um resultado perfeito.
               </p>
             </div>
          </div>
        </div>

        {/* Visualização de Resultado */}
        <div className="lg:col-span-8">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-[3rem] min-h-[500px] md:h-[750px] flex items-center justify-center relative overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl transition-all">
            {isGenerating ? (
              <div className="text-center space-y-8 p-12 animate-in fade-in zoom-in duration-500">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-600/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-2 border-indigo-400 border-b-transparent rounded-full animate-spin-slow"></div>
                </div>
                <div className="space-y-3">
                  <p className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white animate-pulse">{steps[loadingStep]}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    Nosso motor neural está integrando as texturas. Aguarde a renderização final.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full p-4 md:p-8 animate-in zoom-in-95 duration-700 flex flex-col">
                <div className="relative flex-grow rounded-[2.5rem] overflow-hidden group shadow-2xl bg-white flex items-center justify-center">
                  <img src={result} key={result} className="max-w-full max-h-[650px] object-contain" alt="Resultado Final" />
                  
                  {/* Badges de Sucesso */}
                  <div className="absolute top-8 left-8 flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">Look Synthesized</div>
                    <div className="bg-emerald-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">HD Result</div>
                  </div>

                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                    <a 
                      href={result} 
                      download={`lookcerto-${Date.now()}.jpg`} 
                      className="bg-slate-900 text-white px-8 py-5 rounded-[1.5rem] shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[11px] uppercase tracking-widest"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Baixar Simulação
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 p-12 max-w-sm">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-white/50 dark:bg-white/5 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-dashed border-slate-200 dark:border-slate-800 transition-all hover:border-indigo-200">
                  <svg className="w-16 h-16 md:w-24 md:h-24 text-slate-200 dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-300 dark:text-slate-700 uppercase">Estúdio Vazio</h2>
                  <p className="text-[10px] font-bold text-slate-300 dark:text-slate-800 uppercase tracking-widest leading-relaxed">
                    Carregue as fotos à esquerda e selecione a categoria para iniciar a síntese profissional.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
