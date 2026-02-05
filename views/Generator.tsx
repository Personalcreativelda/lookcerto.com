
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
    "Analisando postura...",
    "Extraindo texturas...",
    "Costurando pixels...",
    "Enviando para o Storage...",
    "Finalizando look..."
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
      setError({ message: "Créditos esgotados! Faça um upgrade para continuar." });
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);
    
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % steps.length);
    }, 2500);

    try {
      // 1. Gera com Gemini (Base64)
      const base64Result = await geminiService.generateMockup(
        personImg,
        productImg,
        category
      );

      // 2. Upload para MinIO/S3
      const fileName = `look-${Date.now()}`;
      const hostedUrl = await storageService.uploadBase64Image(base64Result, fileName);

      const newMockup: MockupResult = {
        id: `mock_${Date.now()}`,
        timestamp: Date.now(),
        imageUrl: hostedUrl, // Agora usamos a URL do MinIO
        personUrl: personImg,
        productUrl: productImg,
        category: category,
        prompt: `Provador Virtual para ${category}`
      };

      setResult(hostedUrl);
      onSuccess(newMockup);
    } catch (err: any) {
      setError({ message: "Falha na geração ou no armazenamento. Verifique sua conexão e tente novamente." });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Estúdio Look Certo IA</h1>
        <p className="text-slate-500 mt-2 text-lg italic">Hospedagem profissional de mockups integrada via MinIO.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-sm font-bold">{error.message}</p>
          </div>
          <button onClick={() => setError(null)} className="font-black">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">1. CATEGORIA</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    category === cat ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">2. FOTO DA PESSOA</label>
            <div className={`relative border-2 border-dashed rounded-2xl transition-all ${personImg ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'person')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="p-8 text-center">
                {personImg ? (
                  <img src={personImg} className="w-20 h-20 object-cover mx-auto rounded-lg shadow-md" alt="Pessoa" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">CARREGAR MODELO</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">3. FOTO DO PRODUTO</label>
            <div className={`relative border-2 border-dashed rounded-2xl transition-all ${productImg ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-300'}`}>
              <input type="file" onChange={(e) => handleFileUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              <div className="p-8 text-center">
                {productImg ? (
                  <img src={productImg} className="w-20 h-20 object-cover mx-auto rounded-lg shadow-md" alt="Produto" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">CARREGAR PEÇA</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!personImg || !productImg || isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all uppercase tracking-widest ${
              !personImg || !productImg || isGenerating ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isGenerating ? 'Criando e Hospedando...' : 'Gerar e Salvar'}
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-100 rounded-[2.5rem] min-h-[600px] flex items-center justify-center overflow-hidden border border-slate-200 relative shadow-inner">
            {isGenerating ? (
              <div className="text-center p-12 space-y-6">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-2xl font-black text-slate-800 animate-pulse">{steps[loadingStep]}</h3>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col p-8 animate-in zoom-in-95 duration-500">
                <div className="flex-grow flex items-center justify-center">
                  <img src={result} className="max-w-full max-h-[500px] object-contain rounded-3xl shadow-2xl border-8 border-white" alt="Resultado Final" />
                </div>
                <div className="mt-8 bg-white p-6 rounded-3xl flex items-center justify-between border border-slate-100 shadow-lg">
                  <div className="text-left">
                    <p className="font-black text-slate-800">Mockup Hospedado</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{result}</p>
                  </div>
                  <a href={result} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-all">Ver Link Direto</a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <svg className="w-20 h-20 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p className="font-medium">O resultado aparecerá aqui e será salvo no seu MinIO.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
