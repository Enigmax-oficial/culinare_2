import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, Flame, MessageSquare, Share2, Star, Loader2, CheckCircle, Circle, Send, Trash2, UserPlus } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { authService } from '../services/authService';
import { Recipe, Comment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const user = authService.getUser();

  // Checklist State
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  // Comment State
  const [commentText, setCommentText] = useState('');

  // Rating State
  const [showRatingSuggestion, setShowRatingSuggestion] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const loadRecipe = async () => {
    if (id) {
      setLoading(true);
      try {
        const data = await recipeService.getRecipeById(id);
        setRecipe(data || null);
        
        // Load user's personal rating
        const personal = recipeService.getMyRating(id);
        setMyRating(personal);
      } catch (error) {
        console.error("Error loading recipe", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const toggleIngredient = (id: string) => {
    const next = new Set(checkedIngredients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedIngredients(next);
  };

  const toggleStep = (id: string) => {
    const next = new Set(checkedSteps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedSteps(next);
  };

  const handlePostComment = () => {
    if (!user || !recipe || !commentText.trim()) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: commentText,
      createdAt: Date.now()
    };

    recipeService.addComment(recipe.id, newComment);
    setCommentText('');
    loadRecipe(); // Reload to see new comment
  };

  const handleDelete = () => {
    if (!recipe) return;
    if (window.confirm(t('delete_recipe_confirm'))) {
      setLoading(true);
      try {
        recipeService.delete(recipe.id);
        // Use replace to prevent going back to deleted recipe
        navigate('/', { replace: true });
      } catch (e) {
        console.error("Failed to delete", e);
        setLoading(false);
      }
    }
  };

  const handleRate = (stars: number) => {
    if (!user) {
      setShowRatingSuggestion(true);
      return;
    }
    if (recipe) {
      const updated = recipeService.rate(recipe.id, stars);
      setMyRating(stars); // Instant UI update for user's rating
      if (updated) {
        setRecipe(updated); // Update average
      } else {
         // Fallback for SQL items where we simulate the update locally for this view
         setRecipe(prev => prev ? ({
             ...prev,
             ratingCount: (prev.ratingCount || 0) + (myRating ? 0 : 1) 
             // Note: accurate average recalc for SQL items without persistent storage is complex, 
             // we accept visual approximation here for the demo.
         }) : null);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  if (!recipe) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold text-stone-900">{t('no_results')}</h2>
      <Link to="/" className="mt-4 text-orange-500 font-bold hover:underline">{t('back')}</Link>
    </div>
  );

  const canDelete = user && (user.role === 'dev' || user.id === recipe.authorId);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header / Breadcrumbish */}
      <div className="px-4 py-6">
        <div className="flex justify-between items-start mb-4">
           <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
             {recipe.category}
           </span>
           {canDelete && (
             <button 
               onClick={handleDelete}
               className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-xs font-bold cursor-pointer z-10"
               title={t('delete_recipe')}
             >
               <Trash2 size={16} />
               {t('delete_recipe')}
             </button>
           )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 leading-tight">
          {recipe.title}
        </h1>
        <p className="text-stone-500 font-medium text-sm mb-6">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-2 mb-8">
           <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-xs overflow-hidden">
             {recipe.authorName.charAt(0)}
           </div>
           <span className="text-xs font-bold text-stone-600">{recipe.authorName}</span>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-[40px] overflow-hidden aspect-video shadow-2xl shadow-stone-200 mb-10">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          {/* Rating Overlay */}
          <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-stone-900 text-sm">{recipe.rating || 0}</span>
              <span className="text-[10px] text-stone-400 font-bold">({recipe.ratingCount || 0})</span>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-orange-500 transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Practical Rating Section */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 mb-8 text-center shadow-sm">
           <h3 className="text-sm font-bold text-stone-900 mb-3">
              {myRating > 0 ? t('rating_thanks') : t('rate_this_recipe')}
           </h3>
           
           <div 
             className="flex justify-center gap-2 mb-2" 
             onMouseLeave={() => setHoverRating(0)}
           >
             {[1, 2, 3, 4, 5].map((star) => (
               <button 
                 key={star}
                 onClick={() => handleRate(star)}
                 onMouseEnter={() => setHoverRating(star)}
                 className="transition-transform hover:scale-125 focus:outline-none"
               >
                 <Star 
                   size={32} 
                   className={`transition-colors duration-200 ${(hoverRating || myRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-stone-200'}`} 
                   strokeWidth={3}
                 />
               </button>
             ))}
           </div>
           
           {myRating > 0 && (
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide animate-in fade-in">
                   Sua avaliação: {myRating} estrela{myRating > 1 ? 's' : ''}
               </p>
           )}

           {/* Login Suggestion */}
           {showRatingSuggestion && (
             <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4 animate-in slide-in-from-top-2">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-1">
                      <UserPlus size={20} />
                   </div>
                   <p className="text-xs font-bold text-orange-800">{t('login_to_rate')}</p>
                   <p className="text-[10px] text-orange-600/80 max-w-xs">{t('create_account_suggestion')}</p>
                </div>
             </div>
           )}
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <Clock className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('time')}</p>
               <p className="text-stone-900 font-bold">{recipe.prepTime + recipe.cookTime} min</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <ChefHat className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('preparation')}</p>
               <p className="text-stone-900 font-bold">{recipe.steps.length} Passos</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <Flame className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{t('difficulty')}</p>
               <p className="text-stone-900 font-bold">{recipe.difficulty}</p>
            </div>
        </div>

        {/* Content Split */}
        <div className="grid md:grid-cols-2 gap-12">
           <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-stone-900">{t('ingredients')}</h3>
                 <span className="text-[10px] text-stone-400 font-bold uppercase">{t('checklist_hint')}</span>
              </div>
              <ul className="space-y-4">
                {recipe.ingredients.map(ing => {
                  const isChecked = checkedIngredients.has(ing.id);
                  return (
                    <li 
                      key={ing.id} 
                      onClick={() => toggleIngredient(ing.id)}
                      className={`flex items-center gap-3 text-sm font-medium cursor-pointer select-none transition-all p-2 rounded-xl hover:bg-stone-50 ${isChecked ? 'text-stone-300 line-through' : 'text-stone-600'}`}
                    >
                      {isChecked ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> : <Circle size={18} className="text-stone-300 flex-shrink-0" />}
                      {ing.name}
                    </li>
                  );
                })}
              </ul>
           </div>

           <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-stone-900">{t('preparation')}</h3>
                 <span className="text-[10px] text-stone-400 font-bold uppercase">{t('checklist_hint')}</span>
              </div>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => {
                  const isChecked = checkedSteps.has(step.id);
                  return (
                    <div 
                      key={step.id} 
                      onClick={() => toggleStep(step.id)}
                      className={`flex gap-4 cursor-pointer select-none group p-3 rounded-2xl transition-all ${isChecked ? 'bg-stone-50' : 'hover:bg-stone-50'}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isChecked ? 'bg-green-100 text-green-600' : 'bg-orange-500 text-white'}`}>
                        {isChecked ? <CheckCircle size={16} /> : index + 1}
                      </div>
                      <p className={`text-sm font-medium leading-relaxed pt-1 transition-colors ${isChecked ? 'text-stone-300 line-through' : 'text-stone-600'}`}>
                        {step.text}
                      </p>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 pt-10 border-t border-stone-100">
           <div className="flex items-center gap-2 mb-6">
             <MessageSquare size={20} className="text-stone-900" />
             <h3 className="text-lg font-bold text-stone-900">{t('comments')} ({recipe.comments?.length || 0})</h3>
           </div>
           
           {/* Add Comment Form */}
           {user ? (
             <div className="bg-white p-6 rounded-3xl border border-stone-100 mb-8 shadow-sm">
                <div className="flex gap-3 mb-4">
                   {user.avatar ? (
                      <img src={user.avatar} className="w-10 h-10 rounded-full" alt={user.name} />
                   ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                   )}
                   <div>
                      <p className="font-bold text-stone-900 text-sm">{user.name}</p>
                      <p className="text-xs text-stone-400">Compartilhe sua experiência</p>
                   </div>
                </div>
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-stone-50 rounded-xl p-4 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all resize-none mb-3"
                  rows={3}
                  placeholder={t('leave_comment')}
                ></textarea>
                <div className="flex justify-end">
                  <button 
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                    className="bg-orange-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {t('send')} <Send size={14} />
                  </button>
                </div>
             </div>
           ) : (
             <div className="bg-stone-50 rounded-2xl p-6 text-center mb-8">
               <p className="text-stone-500 text-sm font-medium">Faça login para comentar.</p>
             </div>
           )}
           
           {/* Comments List */}
           <div className="space-y-6">
              {recipe.comments && recipe.comments.length > 0 ? (
                recipe.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4 animate-in slide-in-from-bottom-2">
                     {comment.userAvatar ? (
                        <img src={comment.userAvatar} className="w-10 h-10 rounded-full flex-shrink-0 bg-stone-100" alt={comment.userName} />
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold flex-shrink-0">
                          {comment.userName.charAt(0)}
                        </div>
                     )}
                     <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none border border-stone-100">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-bold text-stone-900 text-sm">{comment.userName}</span>
                           <span className="text-[10px] text-stone-400 font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">{comment.text}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-stone-400">Nenhum comentário ainda. Seja o primeiro!</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}