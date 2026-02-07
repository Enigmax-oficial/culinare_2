import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UtensilsCrossed, Croissant, Coffee, Soup, Pizza, IceCream, Sandwich, GlassWater, Plus, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { recipeService } from '../services/recipeService.js';
import { CATEGORIES } from '../types.js';
import { useLanguage } from '../contexts/LanguageContext.js';

const CategoryIcon = ({ name }) => {
  switch (name) {
    case 'Café da Manhã': return <Croissant size={14} />;
    case 'Almoço': return <Soup size={14} />;
    case 'Jantar': return <UtensilsCrossed size={14} />;
    case 'Sobremesa': return <IceCream size={14} />;
    case 'Lanche': return <Sandwich size={14} />;
    case 'Bebida': return <GlassWater size={14} />;
    default: return <Coffee size={14} />;
  }
};

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterMaxTime, setFilterMaxTime] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await recipeService.getAllRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Failed to load recipes', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory = activeCategory === 'Todas' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'Todas' || r.difficulty === filterDifficulty;
    const totalTime = r.prepTime + r.cookTime;
    const matchesTime = filterMaxTime === 0 || totalTime <= filterMaxTime;
    return matchesCategory && matchesSearch && matchesDifficulty && matchesTime;
  });

  return (
    <div>
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 leading-tight">{t('hero_title')}</h1>
        <p className="text-stone-500 max-w-xl mx-auto text-sm md:text-base mt-4 font-medium">{t('hero_subtitle')}</p>

        <div className="mt-8 relative max-w-lg mx-auto z-20">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input type="text" placeholder={t('search_placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-14 py-4 rounded-full border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all text-sm font-medium" />
             <button onClick={() => setShowFilters(!showFilters)} className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
               {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
             </button>
          </div>

          {showFilters && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-stone-100 p-6 animate-in slide-in-from-top-2 duration-200 text-left">
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">{t('difficulty')}</label>
                      <div className="flex gap-2">
                         {['Todas', 'Fácil', 'Médio', 'Difícil'].map(d => (
                           <button key={d} onClick={() => setFilterDifficulty(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterDifficulty === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-stone-600 border-stone-200'}`}>{d}</button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">{t('time')}: {filterMaxTime === 0 ? 'Qualquer' : `${filterMaxTime} min`}</label>
                      <input type="range" min="0" max="180" step="15" value={filterMaxTime} onChange={(e) => setFilterMaxTime(parseInt(e.target.value))} className="w-full accent-orange-500 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer" />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-bold"><span>Qualquer</span><span>3h</span></div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="px-4 mb-12">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 justify-start md:justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' : 'bg-white text-stone-600 border-stone-100 hover:border-stone-200'}`}>
              {cat !== 'Todas' && <CategoryIcon name={cat} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">{activeCategory}</h2>
          <span className="text-xs text-stone-400 font-bold">{loading ? '...' : `${filteredRecipes.length} receitas`}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={48} /></div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <div className="text-stone-200 mb-4 flex justify-center"><UtensilsCrossed size={48} /></div>
            <h3 className="text-stone-900 font-bold mb-1">{t('no_results')}</h3>
            <p className="text-stone-400 text-xs mb-6">Tente ajustar os filtros ou busque outro termo.</p>
            <Link to="/new" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors"><Plus size={16} />{t('new_recipe')}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map(recipe => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="group bg-white p-3 rounded-[32px] border border-stone-100 hover:shadow-xl hover:border-stone-200 transition-all duration-300">
                <div className="relative aspect-video rounded-[24px] overflow-hidden bg-stone-100 mb-4">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-600">{recipe.category}</span>
                  {recipe.status === 'pending' && (<span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{t('pending')}</span>)}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-lg text-stone-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-stone-400 font-medium mt-3">
                    <span className="flex items-center gap-1"><div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">{recipe.authorName.charAt(0)}</div>{recipe.authorName}</span>
                    <span>•</span>
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UtensilsCrossed, Croissant, Coffee, Soup, Pizza, IceCream, Sandwich, GlassWater, Plus, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { CATEGORIES } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const CategoryIcon = ({ name }) => {
  switch (name) {
    case 'Café da Manhã': return <Croissant size={14} />;
    case 'Almoço': return <Soup size={14} />;
    case 'Jantar': return <UtensilsCrossed size={14} />;
    case 'Sobremesa': return <IceCream size={14} />;
    case 'Lanche': return <Sandwich size={14} />;
    case 'Bebida': return <GlassWater size={14} />;
    default: return <Coffee size={14} />;
  }
};

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterMaxTime, setFilterMaxTime] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await recipeService.getAllRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Failed to load recipes", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory = activeCategory === 'Todas' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'Todas' || r.difficulty === filterDifficulty;
    const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
    const matchesTime = filterMaxTime === 0 || totalTime <= filterMaxTime;
    return matchesCategory && matchesSearch && matchesDifficulty && matchesTime;
  });

  return (
    <div>
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-stone-500 max-w-xl mx-auto text-sm md:text-base mt-4 font-medium">
          {t('hero_subtitle')}
        </p>

        <div className="mt-8 relative max-w-lg mx-auto z-20">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input 
               type="text" 
               placeholder={t('search_placeholder')}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-14 py-4 rounded-full border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all text-sm font-medium"
             />
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
             >
               {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
             </button>
          </div>

          {showFilters && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-stone-100 p-6 animate-in slide-in-from-top-2 duration-200 text-left">
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">{t('difficulty')}</label>
                      <div className="flex gap-2">
                         {['Todas', 'Fácil', 'Médio', 'Difícil'].map(d => (
                           <button 
                             key={d}
                             onClick={() => setFilterDifficulty(d)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterDifficulty === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-stone-600 border-stone-200'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">
                        {t('time')}: {filterMaxTime === 0 ? 'Qualquer' : `${filterMaxTime} min`}
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="180" 
                        step="15" 
                        value={filterMaxTime}
                        onChange={(e) => setFilterMaxTime(parseInt(e.target.value))}
                        className="w-full accent-orange-500 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-bold">
                        <span>Qualquer</span>
                        <span>3h</span>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="px-4 mb-12">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 justify-start md:justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' 
                  : 'bg-white text-stone-600 border-stone-100 hover:border-stone-200'
              }`}
            >
              {cat !== 'Todas' && <CategoryIcon name={cat} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">{activeCategory}</h2>
          <span className="text-xs text-stone-400 font-bold">
            {loading ? '...' : `${filteredRecipes.length} receitas`}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <div className="text-stone-200 mb-4 flex justify-center">
              <UtensilsCrossed size={48} />
            </div>
            <h3 className="text-stone-900 font-bold mb-1">{t('no_results')}</h3>
            <p className="text-stone-400 text-xs mb-6">Tente ajustar os filtros ou busque outro termo.</p>
            <Link to="/new" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors">
              <Plus size={16} />
              {t('new_recipe')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map(recipe => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="group bg-white p-3 rounded-[32px] border border-stone-100 hover:shadow-xl hover:border-stone-200 transition-all duration-300">
                <div className="relative aspect-video rounded-[24px] overflow-hidden bg-stone-100 mb-4">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-600">
                    {recipe.category}
                  </span>
                  {recipe.status === 'pending' && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {t('pending')}
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-lg text-stone-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-stone-400 font-medium mt-3">
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                        {recipe.authorName.charAt(0)}
                      </div>
                      {recipe.authorName}
                    </span>
                    <span>•</span>
                    <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UtensilsCrossed, Croissant, Coffee, Soup, Pizza, IceCream, Sandwich, GlassWater, Plus, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { recipeService } from '../services/recipeService';
import { CATEGORIES } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const CategoryIcon = ({ name }) => {
  switch (name) {
    case 'Café da Manhã': return <Croissant size={14} />;
    case 'Almoço': return <Soup size={14} />;
    case 'Jantar': return <UtensilsCrossed size={14} />;
    case 'Sobremesa': return <IceCream size={14} />;
    case 'Lanche': return <Sandwich size={14} />;
    case 'Bebida': return <GlassWater size={14} />;
    default: return <Coffee size={14} />;
  }
};

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('Todas');
  const [filterMaxTime, setFilterMaxTime] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await recipeService.getAllRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Failed to load recipes", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory = activeCategory === 'Todas' || r.category === activeCategory;
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'Todas' || r.difficulty === filterDifficulty;
    const totalTime = r.prepTime + r.cookTime;
    const matchesTime = filterMaxTime === 0 || totalTime <= filterMaxTime;

    return matchesCategory && matchesSearch && matchesDifficulty && matchesTime;
  });

  return (
    <div>
      {/* Hero */}
      <div className="pt-16 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-2 leading-tight">
          {t('hero_title')}
        </h1>
        <p className="text-stone-500 max-w-xl mx-auto text-sm md:text-base mt-4 font-medium">
          {t('hero_subtitle')}
        </p>

        {/* Search */}
        <div className="mt-8 relative max-w-lg mx-auto z-20">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input 
               type="text" 
               placeholder={t('search_placeholder')}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-14 py-4 rounded-full border border-stone-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all text-sm font-medium"
             />
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
             >
               {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
             </button>
          </div>

          {showFilters && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-stone-100 p-6 animate-in slide-in-from-top-2 duration-200 text-left">
                <div className="space-y-4">
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">{t('difficulty')}</label>
                      <div className="flex gap-2">
                         {['Todas', 'Fácil', 'Médio', 'Difícil'].map(d => (
                           <button 
                             key={d}
                             onClick={() => setFilterDifficulty(d)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${filterDifficulty === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-stone-600 border-stone-200'}`}
                           >
                             {d}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-stone-500 mb-2 block">
                        {t('time')}: {filterMaxTime === 0 ? 'Qualquer' : `${filterMaxTime} min`}
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="180" 
                        step="15" 
                        value={filterMaxTime}
                        onChange={(e) => setFilterMaxTime(parseInt(e.target.value))}
                        className="w-full accent-orange-500 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-bold">
                        <span>Qualquer</span>
                        <span>3h</span>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-12">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 justify-start md:justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100' 
                  : 'bg-white text-stone-600 border-stone-100 hover:border-stone-200'
              }`}
            >
              {cat !== 'Todas' && <CategoryIcon name={cat} />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900">{activeCategory}</h2>
          <span className="text-xs text-stone-400 font-bold">
            {loading ? '...' : `${filteredRecipes.length} receitas`}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <div className="text-stone-200 mb-4 flex justify-center">
              <UtensilsCrossed size={48} />
            </div>
            <h3 className="text-stone-900 font-bold mb-1">{t('no_results')}</h3>
            <p className="text-stone-400 text-xs mb-6">Tente ajustar os filtros ou busque outro termo.</p>
            <Link to="/new" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors">
              <Plus size={16} />
              {t('new_recipe')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.map(recipe => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="group bg-white p-3 rounded-[32px] border border-stone-100 hover:shadow-xl hover:border-stone-200 transition-all duration-300">
                <div className="relative aspect-video rounded-[24px] overflow-hidden bg-stone-100 mb-4">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-600">
                    {recipe.category}
                  </span>
                  {recipe.status === 'pending' && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {t('pending')}
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-lg text-stone-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-stone-400 font-medium mt-3">
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                        {recipe.authorName.charAt(0)}
                      </div>
                      {recipe.authorName}
                    </span>
                    <span>•</span>
                    <span>{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
