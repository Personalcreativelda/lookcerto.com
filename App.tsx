
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

// Fix: Move PrivateRoute outside the component to prevent recreation on every render
// and to fix the TypeScript error where children were not correctly inferred when defined inline.
interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('lookcerto_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Falha ao carregar estado:", e);
    }
    return {
      user: null,
      history: [],
      isGenerating: false,
      isAuthenticated: false
    };
  });

  useEffect(() => {
    localStorage.setItem('lookcerto_state', JSON.stringify(state));
  }, [state]);

  const login = (user: User) => {
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
  };

  const addHistoryItem = (item: MockupResult) => {
    if (!state.user) return;
    setState(prev => {
      const newHistory = [item, ...prev.history].slice(0, 15);
      return {
        ...prev,
        history: newHistory,
        user: prev.user ? { ...prev.user, credits: Math.max(0, prev.user.credits - 1) } : null
      };
    });
  };

  const updatePlan = (plan: PlanType) => {
    if (!state.user) return;
    let credits = 5;
    if (plan === PlanType.PRO) credits = 50;
    if (plan === PlanType.ENTERPRISE) credits = 9999;
    
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, plan, credits } : null
    }));
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {state.isAuthenticated && <Navbar user={state.user!} onLogout={logout} />}
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
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
          <p>© 2024 lookcerto.com - Tecnologia de Provador Virtual IA para Moçambique e o Mundo.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
