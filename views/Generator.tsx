
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
    "Analisando biotipo...",
    "Ajustando caimento do tecido...",
    "Renderizando texturas...",
    "Finalizando iluminação..."
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
        const MAX_SIZE = 1024;
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
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
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
      setError("Créditos insuficientes. Faça um upgrade.");
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
      
      const fileName = `look_${Date.now()}`;
      const finalUrl = await storageService.uploadBase64Image(base64Result, fileName);

      const mockup: MockupResult = {
        id: `m_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: finalUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Virtual Try-On ${category}`
      };

      setResult(finalUrl);
      onSuccess(mockup);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado na renderização.");
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
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
          LookCerto <span className="text-indigo-600">Engine</span>
        </h1>
        {(personImg || result) && (
          <button 
            onClick={reset} 
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg"
          >
            Limpar e Reiniciar
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between text-red-600 dark:text-red-400 text-sm font-bold">
          <p className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </p>
          <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-full">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna de Controles */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sua Base</span>
                <div className={`aspect-[3/4] border-2 border-dashed rounded-2xl overflow-hidden relative transition-all ${personImg ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                  <input type="file" onChange={e => handleFileUpload(e, 'person')} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                  {personImg ? (
                    <img src={personImg} className="w-full h-full object-cover" alt="Sua base" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Foto</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">A Roupa</span>
                <div className={`aspect-[3/4] border-2 border-dashed rounded-2xl overflow-hidden relative transition-all ${productImg ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                  <input type="file" onChange={e => handleFileUpload(e, 'product')} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                  {productImg ? (
                    <img src={productImg} className="w-full h-full object-cover" alt="Produto" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Roupa</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categoria do Item</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !personImg || !productImg}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                isGenerating 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-xl shadow-indigo-100 dark:shadow-none'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  Renderizando...
                </>
              ) : 'Simular Caimento'}
            </button>
          </div>

          <div className="bg-indigo-50 dark:bg-slate-900 p-5 rounded-2xl border border-indigo-100 dark:border-slate-800">
             <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Dica de Qualidade</h4>
             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
               Para melhores resultados, use uma foto da pessoa de frente com as mãos visíveis e uma foto da roupa em fundo neutro.
             </p>
          </div>
        </div>

        {/* Coluna de Visualização */}
        <div className="lg:col-span-8">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] min-h-[500px] md:h-[700px] flex items-center justify-center relative overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl transition-all">
            {isGenerating ? (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{steps[loadingStep]}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processando Motor Neural</p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full p-4 md:p-8 animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center">
                <div className="relative max-w-full max-h-full group">
                  <img src={result} className="max-w-full max-h-[600px] object-contain rounded-3xl shadow-2xl" alt="Resultado LookCerto" />
                  <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={result} 
                      download={`lookcerto-${Date.now()}.jpg`} 
                      className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Baixar HD
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-12">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <svg className="w-10 h-10 md:w-16 md:h-16 text-slate-200 dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-400 dark:text-slate-700 uppercase">Aguardando Configuração</h2>
                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-800 uppercase tracking-widest">Configure os uploads ao lado para iniciar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
