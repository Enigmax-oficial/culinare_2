import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Check, X, Clock, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { authService } from '../services/authService';
import { Recipe } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);
  // Local state to track trusted status changes immediately in UI
  const [trustedAuthors, setTrustedAuthors] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  
  useEffect(() => {
    const user = authService.getUser();
    if (!user || user.role !== 'dev') {
      navigate('/');
      return;
    }
    setPendingRecipes(recipeService.getPendingRecipes());
  }, [navigate]);

  useEffect(() => {
    // Sync local trusted state with pending recipes authors
    const initialTrusted = new Set<string>();
    pendingRecipes.forEach(r => {
        if (recipeService.isAuthorTrusted(r.authorId)) {
            initialTrusted.add(r.authorId);
        }
    });
    setTrustedAuthors(initialTrusted);
  }, [pendingRecipes]);

  const handleVerify = (id: string) => {
    recipeService.updateStatus(id, 'verified');
    setPendingRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleReject = (id: string) => {
    if(confirm('Tem certeza que deseja rejeitar e excluir esta receita?')) {
        recipeService.updateStatus(id, 'rejected');
        setPendingRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleTrustAuthor = (authorId: string) => {
    const isTrusted = trustedAuthors.has(authorId);
    if (!isTrusted) {
        if (confirm(t('mark_trusted') + '?')) {
            recipeService.trustAuthor(authorId);
            setTrustedAuthors(prev => new Set(prev).add(authorId));
        }
    }
    // Note: We currently don't implement "un-trusting" via this simple UI, 
    // as the requirement was just to add the verification method.
  };

  return (
    <div className="px-4 py-8 animate-in fade-in duration-500">
       <div className="flex items-center gap-2 mb-8">
        <Link to="/" className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900">
           <ArrowLeft size={16} />
        </Link>
        <div className="flex items-center gap-2">
            <ShieldCheck className="text-orange-500" />
            <h1 className="text-2xl font-black text-stone-900">{t('admin_panel')}</h1>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8">
          <h2 className="text-orange-800 font-bold mb-1">{t('admin_area')}</h2>
          <p className="text-orange-600/80 text-sm">{t('admin_desc')}</p>
      </div>

      <h3 className="font-bold text-stone-900 mb-4">{t('pending')} ({pendingRecipes.length})</h3>

      {pendingRecipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
              <ShieldCheck className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-400 font-medium">Nenhuma receita pendente.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {pendingRecipes.map(recipe => {
                  const isTrusted = trustedAuthors.has(recipe.authorId);
                  return (
                    <div key={recipe.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-32 h-32 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-1 rounded-md mb-2 inline-block">
                                        {recipe.category}
                                    </span>
                                    <h3 className="font-bold text-stone-900 text-lg leading-tight">
                                        <Link to={`/recipe/${recipe.id}`} className="hover:underline">{recipe.title}</Link>
                                    </h3>
                                </div>
                            </div>
                            <p className="text-stone-500 text-xs mb-4 line-clamp-2">{recipe.description}</p>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4 text-xs text-stone-400 font-bold">
                                    <span>Por: {recipe.authorName}</span>
                                    <span className="flex items-center gap-1"><Clock size={12}/> {recipe.prepTime + recipe.cookTime} min</span>
                                </div>
                                
                                {/* Trust Checkbox */}
                                <button 
                                    onClick={() => toggleTrustAuthor(recipe.authorId)}
                                    className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-800 w-fit"
                                >
                                    {isTrusted ? (
                                        <CheckSquare size={16} className="text-green-500" />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                    <span className={isTrusted ? "text-green-600" : ""}>
                                        {isTrusted ? "Autor Confiável (Verificação Automática)" : t('mark_trusted')}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0 sm:pl-4">
                            <button 
                                onClick={() => handleVerify(recipe.id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                            >
                                <Check size={14} /> {t('approve')}
                            </button>
                            <button 
                                onClick={() => handleReject(recipe.id)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
                            >
                                <X size={14} /> {t('reject')}
                            </button>
                        </div>
                    </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}