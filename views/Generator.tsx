
// Adicionando import do React para resolver erros de namespace 'React'
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
  const [category, setCategory] = useState<Category>(Category.AUTO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Identificando proporções anatômicas...",
    "Mapeando texturas de tecido...",
    "Calculando sombras de contato...",
    "Ajustando balanço de luz...",
    "Renderizando resultado final..."
  ];

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Reduzido levemente para 1200px para garantir estabilidade na API Gemini
        const MAX_SIZE = 1200; 
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
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
      setError({ message: "Créditos insuficientes. Por favor, faça um upgrade no seu plano." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2500);

    try {
      const base64Result = await geminiService.generateMockup(personImg, productImg, category);
      const fileName = `look-final-${Date.now()}`;
      
      // Upload para storage (MinIO/S3 ou Fallback Base64)
      const hostedUrl = await storageService.uploadBase64Image(base64Result, fileName);

      const newMockup: MockupResult = {
        id: `render_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: hostedUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Virtual Try-On: ${category}`
      };

      setResult(hostedUrl);
      onSuccess(newMockup);
      
      // Auto-scroll para o resultado em dispositivos móveis
      setTimeout(() => {
        document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (err: any) {
      setError({ 
        message: err.message || "O motor de renderização encontrou uma instabilidade. Tente fotos com fundo mais simples." 
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-0 px-2 md:px-0">
      <header className="text-center md:text-left px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">LookCerto <span className="text-indigo-600">Engine v4.5</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-lg font-medium">Virtual Try-On Profissional com Inteligência Visionária.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800">
           <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Motor Image-to-Image Ativo</span>
        </div>
      </header>

      {error && (
        <div className="mx-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-5 rounded-2xl flex items-center justify-between text-xs md:text-sm font-bold shadow-lg">
          <p className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {error.message}
          </p>
          <button onClick={() => setError(null)} className="ml-4 p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Painel de Upload */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o Look</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                    category === cat 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-md' 
                      : 'border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                  } ${cat === Category.AUTO ? 'col-span-2 border-dashed' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sua Foto (Base)</label>
              <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center transition-all ${personImg ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50'}`}>
                <input type="file" onChange={(e) => handleFileUpload(e, 'person')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                {personImg ? (
                  <img src={personImg} className="w-full h-full object-cover" alt="Sua Foto" />
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 mx-auto text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span className="text-[9px] text-slate-400 font-black uppercase block">Carregar Selfie</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[8px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Foto do Produto</label>
              <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center transition-all ${productImg ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50'}`}>
                <input type="file" onChange={(e) => handleFileUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                {productImg ? (
                  <img src={productImg} className="w-full h-full object-cover" alt="Produto" />
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 mx-auto text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <span className="text-[9px] text-slate-400 font-black uppercase block">Carregar Roupa</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!personImg || !productImg || isGenerating}
            className={`w-full py-5 rounded-2xl font-black text-xs md:text-sm shadow-2xl transition-all uppercase tracking-widest flex items-center justify-center space-x-3 ${
              !personImg || !productImg || isGenerating 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Renderizando Look...</span>
              </>
            ) : 'Gerar Provador Virtual'}
          </button>
        </div>

        {/* Painel de Visualização */}
        <div id="result-panel" className="lg:col-span-8">
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-[2.5rem] min-h-[500px] md:min-h-[750px] flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 relative shadow-2xl transition-all">
            {isGenerating ? (
              <div className="text-center p-8 space-y-8 max-w-sm">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-600/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-2 border-indigo-400 border-b-transparent rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-indigo-600 font-black text-xs">V4.5</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase animate-pulse">{steps[loadingStep]}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Aguarde. A integração de física de tecidos exige processamento intensivo.</p>
                </div>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col p-4 md:p-8 animate-in zoom-in-95 duration-700">
                <div className="flex-grow flex items-center justify-center relative rounded-[2rem] overflow-hidden group shadow-2xl bg-white">
                  <img src={result} className="max-w-full max-h-[550px] md:max-h-[700px] object-contain" alt="Resultado Final" />
                  <div className="absolute top-6 left-6 flex items-center space-x-2">
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Composição IA</div>
                  </div>
                </div>
                
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-100 dark:border-slate-700 shadow-xl">
                  <div className="text-center sm:text-left">
                    <p className="font-black text-slate-900 dark:text-white text-lg md:text-xl uppercase tracking-tighter">Look Renderizado</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Alta Fidelidade Fotográfica</p>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button onClick={() => window.open(result, '_blank')} className="flex-1 sm:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Ver HD</button>
                    <a href={result} download={`lookcerto-${Date.now()}.jpg`} className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-all shadow-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-300 p-12">
                <div className="w-32 h-32 md:w-48 md:h-48 mx-auto bg-white/50 dark:bg-white/5 rounded-full flex items-center justify-center mb-10 border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <svg className="w-16 h-16 md:w-24 md:h-24 text-slate-200 dark:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-400 dark:text-slate-700 uppercase mb-4">Aguardando Fotos</h2>
                <p className="text-[10px] md:text-xs font-bold text-slate-300 dark:text-slate-800 uppercase tracking-widest max-w-xs mx-auto">Dica: Use fotos de frente com boa iluminação para um caimento perfeito.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
