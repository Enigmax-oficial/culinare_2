import { Recipe, Comment } from '../types';
import { db } from './db';
import { authService } from './authService';

const RECIPE_KEY = 'chef_em_casa_recipes';

const SEED_DATA: Recipe[] = [
  {
    id: '1',
    title: 'Bolo de Chocolate Cremoso',
    description: 'O melhor bolo de chocolate que você vai comer! Massa fofinha, cobertura cremosa e muito fácil de fazer.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
    category: 'Sobremesa',
    prepTime: 20,
    cookTime: 45,
    difficulty: 'Fácil',
    ingredients: [
      { id: '1', name: '3 ovos' },
      { id: '2', name: '1 e 1/2 xícara de açúcar' },
      { id: '3', name: '1/2 xícara de óleo' },
      { id: '4', name: '1 xícara de chocolate em pó' },
      { id: '5', name: '2 xícaras de farinha de trigo' },
      { id: '6', name: '1 xícara de água quente' },
      { id: '7', name: '1 colher (sopa) de fermento' }
    ],
    steps: [
      { id: '1', text: 'Em uma tigela, bata os ovos com o açúcar e o óleo.' },
      { id: '2', text: 'Adicione o chocolate em pó e a farinha.' },
      { id: '3', text: 'Despeje a água quente e misture bem até ficar homogêneo.' },
      { id: '4', text: 'Por último, adicione o fermento.' },
      { id: '5', text: 'Asse em forno preaquecido a 180°C por 40-45 minutos.' }
    ],
    authorId: 'system',
    authorName: 'Chef Em Casa',
    createdAt: Date.now(),
    rating: 5,
    status: 'verified',
    comments: []
  },
  {
    id: '2',
    title: 'Pizza Marguerita Caseira',
    description: 'Pizza napolitana clássica feita em casa com fermentação natural.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop',
    category: 'Jantar',
    prepTime: 60,
    cookTime: 15,
    difficulty: 'Médio',
    ingredients: [
      { id: '1', name: '500g de farinha de trigo' },
      { id: '2', name: '300ml de água' },
      { id: '3', name: '10g de fermento biológico' },
      { id: '4', name: 'Queijo mussarela de búfala' },
      { id: '5', name: 'Manjericão fresco' },
      { id: '6', name: 'Molho de tomate' }
    ],
    steps: [
      { id: '1', text: 'Misture farinha, água e fermento. Sove por 10 min.' },
      { id: '2', text: 'Deixe descansar por 1 hora.' },
      { id: '3', text: 'Abra a massa, coloque o molho e o queijo.' },
      { id: '4', text: 'Asse em forno máximo por 10-15 minutos.' },
      { id: '5', text: 'Finalize com manjericão.' }
    ],
    authorId: 'system',
    authorName: 'Luigi Chef',
    createdAt: Date.now() - 100000,
    rating: 4.8,
    status: 'verified',
    comments: []
  },
  {
    id: '3',
    title: 'Salada Caesar Clássica',
    description: 'Refrescante, crocante e com um molho irresistível.',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1000&auto=format&fit=crop',
    category: 'Almoço',
    prepTime: 15,
    cookTime: 0,
    difficulty: 'Fácil',
    ingredients: [
      { id: '1', name: 'Alface americana' },
      { id: '2', name: 'Croutons' },
      { id: '3', name: 'Queijo parmesão ralado' },
      { id: '4', name: 'Peito de frango grelhado' },
      { id: '5', name: 'Molho Caesar' }
    ],
    steps: [
      { id: '1', text: 'Lave e seque bem as folhas de alface.' },
      { id: '2', text: 'Grelhe o frango e corte em tiras.' },
      { id: '3', text: 'Em uma tigela grande, misture a alface com o molho.' },
      { id: '4', text: 'Adicione o frango, croutons e queijo parmesão por cima.' }
    ],
    authorId: 'system',
    authorName: 'Fit Life',
    createdAt: Date.now() - 200000,
    rating: 4.5,
    status: 'verified',
    comments: []
  }
];

// Helper for local storage
const getLocalRecipes = (): Recipe[] => {
  const stored = localStorage.getItem(RECIPE_KEY);
  if (!stored) {
    localStorage.setItem(RECIPE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const recipeService = {
  // Public Feed: Shows SQL (Community) + Local Verified + My Pending/Rejected
  getAllRecipes: async (): Promise<Recipe[]> => {
    const currentUser = authService.getUser();

    // 1. Fetch from Local Storage
    const localRecipes = getLocalRecipes();

    // 2. Fetch from SQLite (Community/Static) - Assume these are always verified
    const sqlRecipes = await db.getRecipes();
    // Normalize SQL recipes to have status if missing
    const sqlNormalized = sqlRecipes.map(r => ({ ...r, status: 'verified' as const }));

    // 3. Filter Local: Verified OR Owned by User
    const validLocal = localRecipes.filter(r => 
      r.status === 'verified' || (currentUser && r.authorId === currentUser.id)
    );

    const allRecipes = [...validLocal, ...sqlNormalized];
    
    // Remove duplicates by ID
    const seen = new Set();
    return allRecipes.filter(r => {
      const duplicate = seen.has(r.id);
      seen.add(r.id);
      return !duplicate;
    });
  },

  // Admin Only: Get pending
  getPendingRecipes: (): Recipe[] => {
    const local = getLocalRecipes();
    return local.filter(r => r.status === 'pending');
  },

  getRecipeById: async (id: string): Promise<Recipe | undefined> => {
    const localRecipes = getLocalRecipes();
    const localMatch = localRecipes.find(r => r.id === id);
    if (localMatch) return localMatch;

    const sqlMatch = await db.getRecipeById(id);
    if (sqlMatch) return { ...sqlMatch, status: 'verified' };
    
    return undefined;
  },

  create: (recipe: Recipe): void => {
    const recipes = getLocalRecipes();
    // Default to pending
    const newRecipe = { ...recipe, status: 'pending' as const };
    const updated = [newRecipe, ...recipes];
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const recipes = getLocalRecipes();
    const updated = recipes.filter(r => r.id !== id);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  },

  updateStatus: (id: string, status: 'verified' | 'rejected'): void => {
    const recipes = getLocalRecipes();
    const updated = recipes.map(r => r.id === id ? { ...r, status } : r);
    if (status === 'rejected') {
        const filtered = recipes.filter(r => r.id !== id);
        localStorage.setItem(RECIPE_KEY, JSON.stringify(filtered));
    } else {
        localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
    }
  },

  addComment: (recipeId: string, comment: Comment): void => {
    const recipes = getLocalRecipes();
    const updated = recipes.map(r => {
      if (r.id === recipeId) {
        return {
          ...r,
          comments: [...(r.comments || []), comment]
        };
      }
      return r;
    });
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  }
};