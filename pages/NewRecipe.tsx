import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Sparkles, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { recipeService } from '../services/recipeService';
import { authService } from '../services/authService';
import { Ingredient, Step, CATEGORIES } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Gemini Schema for auto-completion
const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    prepTime: { type: Type.NUMBER },
    cookTime: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING } 
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  }
};

export default function NewRecipePage() {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to 'Almoço'
  const [prepTime, setPrepTime] = useState<number>(0);
  const [cookTime, setCookTime] = useState<number>(0);
  const [difficulty, setDifficulty] = useState('Fácil');
  const [image, setImage] = useState<string>('');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: '1', name: '' }]);
  const [steps, setSteps] = useState<Step[]>([{ id: '1', text: '' }]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: crypto.randomUUID(), name: '' }]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  const updateIngredient = (id: string, val: string) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, name: val } : i));
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: crypto.randomUUID(), text: '' }]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, val: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, text: val } : s));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateWithAI = async () => {
    if (!title.trim() || !process.env.API_KEY) return;
    setAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: `Create a recipe based on this title: "${title}". Language: Portuguese (Brazil).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: RECIPE_SCHEMA,
        }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setDescription(data.description || '');
        setPrepTime(data.prepTime || 15);
        setCookTime(data.cookTime || 30);
        
        // Map ingredients string[] to Ingredient[]
        if (data.ingredients && Array.isArray(data.ingredients)) {
           setIngredients(data.ingredients.map((ing: string) => ({ id: crypto.randomUUID(), name: ing })));
        }
        
        // Map steps string[] to Step[]
        if (data.steps && Array.isArray(data.steps)) {
           setSteps(data.steps.map((st: string) => ({ id: crypto.randomUUID(), text: st })));
        }

        // Map difficulty roughly
        const diff = data.difficulty?.toLowerCase();
        if (diff?.includes('fácil') || diff?.includes('easy')) setDifficulty('Fácil');
        else if (diff?.includes('médio') || diff?.includes('medium')) setDifficulty('Médio');
        else setDifficulty('Difícil');
      }

    } catch (e) {
      console.error(e);
      alert('Erro ao gerar receita com IA.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newRecipe = {
      id: crypto.randomUUID(),
      title,
      description,
      // Use uploaded image or fallback to placeholder
      image: image || `https://picsum.photos/seed/${title}/800/600`, 
      category,
      prepTime,
      cookTime,
      difficulty: difficulty as any,
      ingredients: ingredients.filter(i => i.name.trim() !== ''),
      steps: steps.filter(s => s.text.trim() !== ''),
      authorId: user?.id || 'anon',
      authorName: user?.name || 'Anônimo',
      createdAt: Date.now(),
      status: 'pending' as const
    };

    recipeService.create(newRecipe);
    navigate('/');
  };

  return (
    <div className="px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900">
           <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-black text-stone-900">{t('new_recipe')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-6">
           <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">{t('basic_info')}</h2>
           
           <div>
             <label className="block text-xs font-bold text-stone-500 mb-2">{t('recipe_title')} *</label>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Bolo de Chocolate" 
                  className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                />
                {process.env.API_KEY && (
                  <button 
                    type="button" 
                    onClick={generateWithAI}
                    disabled={!title || aiLoading}
                    className="bg-purple-100 text-purple-600 px-4 rounded-xl flex items-center gap-2 text-xs font-black hover:bg-purple-200 transition-colors"
                  >
                    {aiLoading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    <span className="hidden sm:inline">{t('magic')}</span>
                  </button>
                )}
             </div>
           </div>

           <div>
             <label className="block text-xs font-bold text-stone-500 mb-2">{t('description')}</label>
             <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="..."
               className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all h-24 resize-none"
             ></textarea>
           </div>
           
           {/* Image Upload */}
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageUpload} 
             className="hidden" 
             accept="image/*"
           />
           <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${image ? 'border-orange-500 bg-orange-50' : 'border-stone-200 hover:bg-stone-50 hover:border-orange-200'}`}
              style={{ minHeight: '200px' }}
           >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="relative z-10 flex flex-col items-center text-orange-700">
                    <ImageIcon size={32} className="mb-2" />
                    <p className="text-xs font-bold bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">{t('image_upload_text')}</p>
                  </div>
                </>
              ) : (
                <div className="text-stone-400 text-center">
                  <Upload size={24} className="mb-2 mx-auto" />
                  <p className="text-xs font-bold">{t('image_upload_text')}</p>
                  <p className="text-[10px] mt-1 opacity-60">PNG, JPG até 5MB</p>
                </div>
              )}
           </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
              <label className="block text-[10px] font-bold text-stone-400 mb-1">{t('prep_time')}</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(parseInt(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-stone-400 mb-1">{t('cook_time')}</label>
              <input type="number" value={cookTime} onChange={(e) => setCookTime(parseInt(e.target.value))} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold" />
           </div>
           <div>
              <label className="block text-[10px] font-bold text-stone-400 mb-1">{t('difficulty')}</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold">
                 <option>Fácil</option>
                 <option>Médio</option>
                 <option>Difícil</option>
              </select>
           </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 mb-1">{t('category')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold">
                 {CATEGORIES.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm">
           <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">{t('ingredients')} *</h2>
           <div className="space-y-3">
             {ingredients.map((ing, idx) => (
               <div key={ing.id} className="flex gap-2">
                 <input 
                   value={ing.name}
                   onChange={(e) => updateIngredient(ing.id, e.target.value)}
                   placeholder={`Item ${idx + 1}`}
                   className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:bg-white focus:border-orange-200"
                 />
                 <button type="button" onClick={() => handleRemoveIngredient(ing.id)} className="text-stone-300 hover:text-red-500 px-2">
                    <Trash2 size={16} />
                 </button>
               </div>
             ))}
             <button type="button" onClick={handleAddIngredient} className="mt-2 text-xs font-black text-orange-500 flex items-center gap-1 hover:text-orange-600">
               <Plus size={14} /> {t('add_ingredient')}
             </button>
           </div>
        </div>

        {/* Steps */}
        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm">
           <h2 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">{t('preparation')} *</h2>
           <div className="space-y-4">
             {steps.map((step, idx) => (
               <div key={step.id} className="flex gap-3 items-start">
                 <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center font-bold text-xs mt-1">
                   {idx + 1}
                 </div>
                 <textarea 
                   value={step.text}
                   onChange={(e) => updateStep(step.id, e.target.value)}
                   placeholder={`Passo ${idx + 1}`}
                   className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:bg-white focus:border-orange-200 resize-none h-20"
                 />
                 <button type="button" onClick={() => handleRemoveStep(step.id)} className="text-stone-300 hover:text-red-500 px-2 mt-2">
                    <Trash2 size={16} />
                 </button>
               </div>
             ))}
             <button type="button" onClick={handleAddStep} className="mt-2 text-xs font-black text-orange-500 flex items-center gap-1 hover:text-orange-600">
               <Plus size={14} /> {t('add_step')}
             </button>
           </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
           <button type="button" onClick={() => navigate('/')} className="flex-1 py-4 rounded-xl font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors">
             {t('cancel')}
           </button>
           <button type="submit" className="flex-[2] py-4 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-xl shadow-orange-100">
             {t('publish')}
           </button>
        </div>
      </form>
    </div>
  );
}