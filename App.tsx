
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, PlanType, MockupResult, AppState } from './types';
import Dashboard from './views/Dashboard';
import Generator from './views/Generator';
import History from './views/History';
import Pricing from './views/Pricing';
import Login from './views/Login';
import Signup from './views/Signup';
import Navbar from './components/Navbar';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('lookcerto_theme') === 'dark' || 
           (!localStorage.getItem('lookcerto_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('lookcerto_v5_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Garantimos que o histórico carregado não quebre a UI
        return { ...parsed, history: parsed.history || [] };
      }
    } catch (e) {
      console.error("Erro ao carregar cache:", e);
    }
    return {
      user: null,
      history: [],
      isGenerating: false,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lookcerto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lookcerto_theme', 'light');
    }
  }, [isDarkMode]);

  // Persistência inteligente: Salva apenas metadados no localStorage para evitar crash
  useEffect(() => {
    if (!state.isAuthenticated) return;
    try {
      const stateToDisk = {
        ...state,
        history: state.history.map(item => ({
          ...item,
          // Se a imagem for muito pesada, não salvamos no localStorage (disco)
          // mas ela permanece viva na MEMÓRIA do app (state) até o F5
          imageUrl: item.imageUrl.length > 300000 ? "PREVIEW_IN_MEMORY" : item.imageUrl,
          personUrl: "REF_IN_MEMORY",
          productUrl: "REF_IN_MEMORY"
        })).slice(0, 10)
      };
      localStorage.setItem('lookcerto_v5_state', JSON.stringify(stateToDisk));
    } catch (e) {
      console.warn("LocalStorage atingiu o limite.");
    }
  }, [state]);

  const login = (user: User) => {
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, history: [], isAuthenticated: false }));
    localStorage.removeItem('lookcerto_v5_state');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const addHistoryItem = (item: MockupResult) => {
    setState(prev => {
      if (!prev.user) return prev;
      return {
        ...prev,
        history: [item, ...prev.history].slice(0, 20),
        user: { ...prev.user, credits: Math.max(0, prev.user.credits - 1) }
      };
    });
  };

  const updatePlan = (plan: PlanType) => {
    setState(prev => {
      if (!prev.user) return prev;
      let credits = 5;
      if (plan === PlanType.PRO) credits = 50;
      if (plan === PlanType.ENTERPRISE) credits = 9999;
      return {
        ...prev,
        user: { ...prev.user, plan, credits }
      };
    });
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {state.isAuthenticated && state.user && (
          <Navbar 
            user={state.user} 
            onLogout={logout} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
        )}
        <main className={`flex-grow ${state.isAuthenticated ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}`}>
          <Routes>
            <Route path="/login" element={!state.isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!state.isAuthenticated ? <Signup onLogin={login} /> : <Navigate to="/" />} />
            
            <Route path="/" element={<PrivateRoute isAuthenticated={state.isAuthenticated}><Dashboard user={state.user!} history={state.history} /></PrivateRoute>} />
            <Route path="/generate" element={<PrivateRoute isAuthenticated={state.isAuthenticated}><Generator user={state.user!} onSuccess={addHistoryItem} /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute isAuthenticated={state.isAuthenticated}><History history={state.history} /></PrivateRoute>} />
            <Route path="/pricing" element={<PrivateRoute isAuthenticated={state.isAuthenticated}><Pricing user={state.user!} onUpgrade={updatePlan} /></PrivateRoute>} />
            
            <Route path="*" element={<Navigate to={state.isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400 text-sm transition-colors">
          <p>© 2024 lookcerto.com - Liderando a Inteligência Artificial em Moda.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
