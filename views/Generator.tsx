
import React, { useState } from 'react';
import { User, Category, MockupResult } from '../types';
import { geminiService } from '../services/geminiService';

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
    "Analisando postura...",
    "Extraindo texturas...",
    "Ajustando iluminação...",
    "Costurando pixels...",
    "Renderizando look final..."
  ];

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      setError(null);
    } catch (e) {
      console.error("Falha ao abrir seletor de chave", e);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
      setError({ message: "Créditos esgotados! Faça um upgrade para continuar." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2800);

    try {
      const generatedUrl = await geminiService.generateMockup(
        personImg,
        productImg,
        category
      );

      const newMockup: MockupResult = {
        id: `mock_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: generatedUrl,
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Provador Virtual para ${category}`
      };

      setResult(generatedUrl);
      onSuccess(newMockup);
    } catch (err: any) {
      if (err.message === "QUOTA_EXHAUSTED") {
        setError({ 
          message: "A cota gratuita da API esgotou. Conecte sua própria chave do Google Cloud para continuar sem limites.",
          type: "QUOTA" 
        });
      } else {
        setError({ message: "Falha na geração. Verifique se as fotos estão nítidas e tente novamente." });
      }
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estúdio de Provador Virtual IA</h1>
        <p className="text-slate-500 mt-2 text-lg">Crie fotos de produtos ultra-realistas em segundos.</p>
      </header>

      {error && (
        <div className={`${error.type === 'QUOTA' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-red-50 border-red-200 text-red-700'} border px-6 py-4 rounded-2xl`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <div>
                <span className="font-bold text-lg block">Ops! Limite Atingido</span>
                <p className="text-sm opacity-90 mt-1">{error.message}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {error.type === 'QUOTA' && (
                <button onClick={handleSelectKey} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                  Conectar Minha Chave
                </button>
              )}
              <button onClick={() => setError(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors font-bold">✕</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PASSO 1: CATEGORIA</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    category === cat 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PASSO 2: FOTO DA PESSOA</label>
            <div className={`relative border-2 border-dashed rounded-2xl transition-all ${personImg ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'person')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="p-8 text-center">
                {personImg ? (
                  <div className="space-y-2">
                    <img src={personImg} className="w-20 h-20 object-cover mx-auto rounded-lg shadow-md" alt="Pessoa" />
                    <span className="text-[10px] font-black text-green-600 block uppercase tracking-tighter">CARREGADO</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">ENVIAR FOTO DO CLIENTE</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PASSO 3: FOTO DO PRODUTO</label>
            <div className={`relative border-2 border-dashed rounded-2xl transition-all ${productImg ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="p-8 text-center">
                {productImg ? (
                  <div className="space-y-2">
                    <img src={productImg} className="w-20 h-20 object-cover mx-auto rounded-lg shadow-md" alt="Produto" />
                    <span className="text-[10px] font-black text-green-600 block uppercase tracking-tighter">CARREGADO</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-8 h-8 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">ENVIAR PEÇA DE ROUPA</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!personImg || !productImg || isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all uppercase tracking-widest ${
              !personImg || !productImg || isGenerating
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? 'Processando...' : 'Gerar Look Certo'}
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-100 rounded-[2.5rem] min-h-[600px] flex items-center justify-center overflow-hidden border border-slate-200 relative shadow-inner">
            {!isGenerating && !result && (
              <div className="text-center p-12">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
                  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Espaço de Trabalho</h3>
                <p className="text-slate-400 mt-4 leading-relaxed max-w-sm mx-auto font-medium">Envie as imagens ao lado para visualizar o seu look gerado por inteligência artificial.</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center p-12 space-y-8">
                <div className="relative w-40 h-40 mx-auto">
                  <div className="absolute inset-0 border-[6px] border-indigo-100 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 border-[6px] border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 animate-pulse tracking-tight">{steps[loadingStep]}</h3>
                  <p className="text-slate-400 font-medium">Aguarde, a IA está criando sua imagem...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="w-full h-full flex flex-col p-8">
                <div className="flex-grow flex items-center justify-center">
                  <img src={result} className="max-w-full max-h-[520px] object-contain rounded-3xl shadow-2xl border-4 border-white" alt="Resultado" />
                </div>
                <div className="mt-8 flex items-center justify-between bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                  <div>
                    <h4 className="font-black text-slate-800 tracking-tight">Look Gerado</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mt-1">Alta definição • IA Vision</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setResult(null)} className="px-5 py-2 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-colors text-sm">Descartar</button>
                    <a href={result} download={`lookcerto-${Date.now()}.jpg`} className="bg-slate-900 text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-black transition-all text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Baixar HD
                    </a>
                  </div>
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
