import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Plus, Search, Home, UtensilsCrossed, ArrowLeft, Trash2, Clock, Sparkles } from 'lucide-react';
import { authService } from './services/authService';
import { User } from './types';
import { AuthModal } from './components/AuthModal';
import HomePage from './pages/Home';
import NewRecipePage from './pages/NewRecipe';
import RecipeDetailPage from './pages/RecipeDetail';

function Layout({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <ChefHat size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900">ChefEmCasa</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            {isHome && (
              <div className="hidden sm:flex gap-6">
                 <span className="text-stone-900 cursor-pointer">Receitas</span>
                 <span className="hover:text-stone-900 cursor-pointer transition-colors">Minhas Receitas</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 ml-2">
              <Link to="/new" className="hidden sm:flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
                <Plus size={14} />
                <span>Nova Receita</span>
              </Link>
              
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  {user.avatar ? (
                     <img src={user.avatar} className="w-8 h-8 rounded-full border border-stone-200" alt={user.name} />
                  ) : (
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 text-stone-600 transition-colors" title="Sair">
                    <ArrowLeft size={14} className="rotate-180" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  R
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <ChefHat size={16} />
            </div>
            <span className="font-bold text-white text-sm">ChefEmCasa</span>
          </div>
          <div className="text-[10px] text-stone-500">
             © 2024 ChefEmCasa. Compartilhe sua paixão pela culinária.
          </div>
        </div>
      </footer>
      
      {/* Mobile Floating Action Button */}
      <Link to="/new" className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl z-40">
        <Plus size={24} />
      </Link>

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewRecipePage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}