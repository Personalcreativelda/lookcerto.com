
import React, { useState } from 'react';
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
  const [category, setCategory] = useState<Category>(Category.TSHIRT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Identificando silhueta...",
    "Posicionando produto...",
    "Ajustando caimento...",
    "Finalizando texturas...",
    "Gerando look virtual..."
  ];

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
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
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
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const compressed = await compressImage(base64);
      if (type === 'person') setPersonImg(compressed);
      else setProductImg(compressed);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!personImg || !productImg) return;
    if (user.credits <= 0) {
      setError({ message: "Capacidade esgotada. Faça upgrade do plano." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2000);

    try {
      const base64Result = await geminiService.generateMockup(personImg, productImg, category);
      const fileName = `look-${Date.now()}`;
      const hostedUrl = await storageService.uploadBase64Image(base64Result, fileName);

      const newMockup: MockupResult = {
        id: `render_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: hostedUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Prova virtual: ${category}`
      };

      setResult(hostedUrl);
      onSuccess(newMockup);
      // Auto scroll to result on mobile
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError({ message: "Falha na simulação. Verifique as fotos e tente novamente." });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <header className="text-center md:text-left px-4">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Estúdio de Simulação</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-lg font-medium">Prove qualquer peça digitalmente agora.</p>
      </header>

      {error && (
        <div className="mx-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center justify-between text-xs md:text-sm font-bold">
          <p>{error.message}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          <div className="space-y-3">
            <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selecione a Peça</label>
            <div className="flex overflow-x-auto pb-2 -mx-1 px-1 gap-2 scrollbar-hide md:grid md:grid-cols-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                    category === cat 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                      : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Foto do Cliente</label>
              <div className={`relative border-2 border-dashed rounded-xl md:rounded-[1.5rem] overflow-hidden aspect-square flex items-center justify-center ${personImg ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50'}`}>
                <input type="file" onChange={(e) => handleFileUpload(e, 'person')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                {personImg ? (
                  <img src={personImg} className="w-full h-full object-cover" alt="Cliente" />
                ) : (
                  <div className="text-center p-2">
                    <svg className="w-6 h-6 md:w-8 md:h-8 mx-auto text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase block leading-tight">Adicionar Pessoa</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Foto do Produto</label>
              <div className={`relative border-2 border-dashed rounded-xl md:rounded-[1.5rem] overflow-hidden aspect-square flex items-center justify-center ${productImg ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50'}`}>
                <input type="file" onChange={(e) => handleFileUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                {productImg ? (
                  <img src={productImg} className="w-full h-full object-cover" alt="Produto" />
                ) : (
                  <div className="text-center p-2">
                    <svg className="w-6 h-6 md:w-8 md:h-8 mx-auto text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase block leading-tight">Adicionar Peça</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!personImg || !productImg || isGenerating}
            className={`w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-xs md:text-sm shadow-xl transition-all uppercase tracking-widest ${
              !personImg || !productImg || isGenerating 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isGenerating ? 'Simulando...' : 'Simular o Look'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] min-h-[400px] md:min-h-[650px] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner transition-colors">
            {isGenerating ? (
              <div className="text-center p-6 space-y-6">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white tracking-tighter animate-pulse">{steps[loadingStep]}</h3>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col p-4 md:p-10 animate-in zoom-in-95 duration-500">
                <div className="flex-grow flex items-center justify-center">
                  <img src={result} className="max-w-full max-h-[400px] md:max-h-[500px] object-contain rounded-xl md:rounded-[2rem] shadow-2xl border-4 md:border-8 border-white dark:border-slate-800" alt="Look Final" />
                </div>
                <div className="mt-6 md:mt-10 bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-xl md:rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-100 dark:border-slate-800">
                  <div className="text-center sm:text-left">
                    <p className="font-black text-slate-900 dark:text-white text-sm md:text-base">Simulação Pronta</p>
                    <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Renderização em 4K</p>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto">
                    <button onClick={() => window.open(result, '_blank')} className="flex-1 sm:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg md:rounded-xl font-black text-[9px] uppercase tracking-widest">Abrir Link</button>
                    <a href={result} download className="bg-indigo-600 text-white p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-indigo-700 transition-all">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-300 p-10 animate-in fade-in">
                <svg className="w-16 h-16 md:w-24 md:h-24 mx-auto opacity-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p className="text-sm md:text-lg font-black tracking-tight text-slate-400 uppercase">Aguardando Fotos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
