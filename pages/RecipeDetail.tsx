import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, Flame, MessageSquare, Share2, Star } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { Recipe } from '../types';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) {
      const data = recipeService.getById(id);
      setRecipe(data || null);
    }
  }, [id]);

  if (!recipe) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold text-stone-900">Receita não encontrada</h2>
      <Link to="/" className="mt-4 text-orange-500 font-bold hover:underline">Voltar para home</Link>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header / Breadcrumbish */}
      <div className="px-4 py-6">
        <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          {recipe.category}
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 leading-tight">
          {recipe.title}
        </h1>
        <p className="text-stone-500 font-medium text-sm mb-6">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-2 mb-8">
           <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-xs">
             {recipe.authorName.charAt(0)}
           </div>
           <span className="text-xs font-bold text-stone-600">{recipe.authorName}</span>
        </div>

        {/* Hero Image */}
        <div className="relative rounded-[40px] overflow-hidden aspect-video shadow-2xl shadow-stone-200 mb-10">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white hover:text-orange-500 transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <Clock className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Tempo</p>
               <p className="text-stone-900 font-bold">{recipe.prepTime + recipe.cookTime} min</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <ChefHat className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Preparo</p>
               <p className="text-stone-900 font-bold">{recipe.steps.length} Passos</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center">
               <Flame className="mx-auto text-orange-500 mb-2" size={20} />
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Dificuldade</p>
               <p className="text-stone-900 font-bold">{recipe.difficulty}</p>
            </div>
        </div>

        {/* Content Split */}
        <div className="grid md:grid-cols-2 gap-12">
           <div>
              <h3 className="text-xl font-black text-stone-900 mb-6">Ingredientes</h3>
              <ul className="space-y-4">
                {recipe.ingredients.map(ing => (
                  <li key={ing.id} className="flex items-center gap-3 text-stone-600 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    {ing.name}
                  </li>
                ))}
              </ul>
           </div>

           <div>
              <h3 className="text-xl font-black text-stone-900 mb-6">Modo de Preparo</h3>
              <div className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-stone-600 text-sm font-medium leading-relaxed pt-1">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 pt-10 border-t border-stone-100">
           <div className="flex items-center gap-2 mb-6">
             <MessageSquare size={20} className="text-stone-900" />
             <h3 className="text-lg font-bold text-stone-900">Comentários (0)</h3>
           </div>
           
           <div className="bg-white p-6 rounded-3xl border border-stone-100">
              <div className="flex gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                   R
                 </div>
                 <div>
                    <p className="font-bold text-stone-900 text-sm">Ruan</p>
                    <div className="flex gap-0.5 text-stone-200 text-xs mt-1">
                      <span className="text-stone-400 text-[10px] mr-2 font-normal">Sua avaliação:</span>
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} />)}
                    </div>
                 </div>
              </div>
              <textarea 
                className="w-full bg-stone-50 rounded-xl p-4 text-sm font-medium border-0 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all resize-none"
                rows={3}
                placeholder="Deixe seu comentário..."
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button className="bg-orange-200 text-orange-800 px-6 py-2 rounded-lg text-xs font-bold hover:bg-orange-300 transition-colors">
                  Comentar
                </button>
              </div>
           </div>
           
           <div className="text-center py-12">
             <p className="text-xs text-stone-400">Nenhum comentário ainda. Seja o primeiro!</p>
           </div>
        </div>
      </div>
    </div>
  );
}