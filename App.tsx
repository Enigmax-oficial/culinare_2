import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Plus, Search, Home, UtensilsCrossed, ArrowLeft, Trash2, Clock, Sparkles, ShieldCheck, Globe, Settings, LogOut, Mic, Download } from 'lucide-react';
import { authService } from './services/authService';
import { User } from './types';
import { AuthModal } from './components/AuthModal';
import HomePage from './pages/Home';
import NewRecipePage from './pages/NewRecipe';
import RecipeDetailPage from './pages/RecipeDetail';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/Settings';
import LiveAssistant from './pages/LiveAssistant';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function Layout({ children }: { children?: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    setUser(authService.getUser());

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-800 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <ChefHat size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-stone-900">{t('app_name')}</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
            {isHome && (
              <div className="hidden sm:flex gap-6">
                 <span className="text-stone-900 cursor-pointer">{t('recipes')}</span>
                 <span className="hover:text-stone-900 cursor-pointer transition-colors">{t('my_recipes')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 ml-2">
              {/* Install Button */}
              {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-900 text-white hover:bg-stone-700 transition-all shadow-md"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">{t('install_app')}</span>
                </button>
              )}

              {/* Language Selector */}
              <div className="relative group">
                 <button className="p-2 hover:bg-stone-100 rounded-full text-stone-600 transition-colors">
                   <Globe size={18} />
                 </button>
                 <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-stone-100 p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => setLanguage('pt')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${language === 'pt' ? 'bg-orange-50 text-orange-600' : 'hover:bg-stone-50'}`}>PT - Português</button>
                    <button onClick={() => setLanguage('en')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${language === 'en' ? 'bg-orange-50 text-orange-600' : 'hover:bg-stone-50'}`}>EN - English</button>
                    <button onClick={() => setLanguage('es')} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${language === 'es' ? 'bg-orange-50 text-orange-600' : 'hover:bg-stone-50'}`}>ES - Español</button>
                 </div>
              </div>

              {/* Live Assistant Link */}
              <Link to="/live" className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-stone-100 text-stone-600 transition-all border border-transparent hover:border-stone-200">
                <Mic size={16} />
                <span className="hidden sm:inline">Sous Chef</span>
              </Link>

              <Link to="/new" className="hidden sm:flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-all shadow-md shadow-orange-100">
                <Plus size={14} />
                <span>{t('new_recipe')}</span>
              </Link>
              
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200 relative group">
                  {user.role === 'dev' && (
                    <Link to="/admin" title={t('admin_panel')} className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors">
                      <ShieldCheck size={14} />
                    </Link>
                  )}
                  <button className="flex items-center gap-2">
                    {user.avatar ? (
                       <img src={user.avatar} className="w-8 h-8 rounded-full border border-stone-200" alt={user.name} />
                    ) : (
                      <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </button>

                  {/* User Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 z-50">
                      <Link to="/settings" className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50">
                        <Settings size={14} />
                        {t('settings')}
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50">
                        <LogOut size={14} />
                        {t('logout')}
                      </button>
                  </div>
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

      <main className="max-w-4xl mx-auto pb-20 w-full flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white">
              <ChefHat size={16} />
            </div>
            <span className="font-bold text-white text-sm">{t('app_name')}</span>
          </div>
          <div className="text-[10px] text-stone-500">
             © 2024 {t('app_name')}.
          </div>
        </div>
      </footer>
      
      {/* Mobile Floating Action Button - Sharp Style */}
      <Link 
        to="/new" 
        className="sm:hidden fixed bottom-20 right-6 w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg z-40 hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        <Plus size={28} strokeWidth={2.5} />
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
      <LanguageProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<NewRecipePage />} />
            <Route path="/recipe/:id" element={<RecipeDetailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/live" element={<LiveAssistant />} />
          </Routes>
        </Layout>
      </LanguageProvider>
    </HashRouter>
  );
}