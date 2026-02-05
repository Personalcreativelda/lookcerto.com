
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
    "Identificando silhueta do cliente...",
    "Posicionando o produto sobre o corpo...",
    "Ajustando caimento e sombreamento...",
    "Otimizando texturas e dobras...",
    "Finalizando look virtual..."
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
      setError({ message: "Capacidade esgotada. Por favor, adquira novas unidades de simulação." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2500);

    try {
      const base64Result = await geminiService.generateMockup(
        personImg,
        productImg,
        category
      );

      const fileName = `look-${Date.now()}`;
      const hostedUrl = await storageService.uploadBase64Image(base64Result, fileName);

      const newMockup: MockupResult = {
        id: `render_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: hostedUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Prova virtual: Cliente com ${category}`
      };

      setResult(hostedUrl);
      onSuccess(newMockup);
    } catch (err: any) {
      setError({ message: "Ocorreu uma falha no processamento. Tente carregar fotos com iluminação mais clara." });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Experimentador Virtual</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">A tecnologia de provador digital mais precisa do mercado.</p>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-[1.5rem] flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-sm font-bold">{error.message}</p>
          </div>
          <button onClick={() => setError(null)} className="font-black opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">1. PEÇA DE ROUPA</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                    category === cat 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-md' 
                      : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">2. FOTO DO CLIENTE</label>
            <div className={`relative border-2 border-dashed rounded-[1.5rem] transition-all overflow-hidden ${personImg ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'person')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
              <div className="p-8 text-center">
                {personImg ? (
                  <div className="relative group/img inline-block">
                    <img src={personImg} className="w-24 h-24 object-cover mx-auto rounded-2xl shadow-lg border-2 border-white dark:border-slate-700" alt="Cliente" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter block">Carregar Cliente</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">3. FOTO DO PRODUTO</label>
            <div className={`relative border-2 border-dashed rounded-[1.5rem] transition-all overflow-hidden ${productImg ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
              <div className="p-8 text-center">
                {productImg ? (
                  <div className="relative group/img inline-block">
                    <img src={productImg} className="w-24 h-24 object-cover mx-auto rounded-2xl shadow-lg border-2 border-white dark:border-slate-700" alt="Produto" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter block">Carregar Peça</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!personImg || !productImg || isGenerating}
            className={`w-full py-5 rounded-[1.5rem] font-black text-sm shadow-2xl transition-all uppercase tracking-widest active:scale-95 ${
              !personImg || !productImg || isGenerating 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {isGenerating ? 'Simulando Look...' : 'Simular o Look'}
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] min-h-[650px] flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-inner group/canvas transition-colors">
            {isGenerating ? (
              <div className="text-center p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter animate-pulse">{steps[loadingStep]}</h3>
                <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Tecnologia de Prova Virtual</p>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col p-10 animate-in zoom-in-95 duration-500">
                <div className="flex-grow flex items-center justify-center relative">
                  <img src={result} className="max-w-full max-h-[500px] object-contain rounded-[2rem] shadow-2xl border-8 border-white dark:border-slate-800" alt="Look Final" />
                </div>
                <div className="mt-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-lg">
                  <div className="text-left">
                    <p className="font-black text-slate-900 dark:text-white">Simulação Concluída</p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Resultado em Alta Definição</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => window.open(result, '_blank')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Link Direto</button>
                    <a href={result} download className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-300 dark:text-slate-700 p-20 animate-in fade-in duration-1000">
                <div className="relative mb-8">
                  <svg className="w-24 h-24 mx-auto opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 blur-[100px] rounded-full"></div>
                </div>
                <p className="text-xl font-black tracking-tight text-slate-400 dark:text-slate-600">O estúdio está pronto para simular.</p>
                <p className="mt-2 text-sm font-medium opacity-60 italic">Carregue as fotos do cliente e do produto.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
