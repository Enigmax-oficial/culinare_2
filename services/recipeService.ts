import { Recipe, Comment } from '../types';
import { db } from './db';
import { authService } from './authService';

const RECIPE_KEY = 'chef_em_casa_recipes';
const DELETED_KEY = 'chef_em_casa_deleted_ids';
const TRUSTED_USERS_KEY = 'chef_em_casa_trusted_users';
const USER_RATINGS_KEY = 'chef_em_casa_user_ratings'; // Stores { recipeId: userRating }

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
    ratingCount: 12,
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
    ratingCount: 8,
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
    ratingCount: 5,
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
  try {
      return JSON.parse(stored);
  } catch(e) {
      console.error("Error parsing local recipes", e);
      return SEED_DATA;
  }
};

const getDeletedIds = (): string[] => {
  try {
    const stored = localStorage.getItem(DELETED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const getTrustedUsers = (): string[] => {
    const stored = localStorage.getItem(TRUSTED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const getUserRatings = (): Record<string, number> => {
    const stored = localStorage.getItem(USER_RATINGS_KEY);
    return stored ? JSON.parse(stored) : {};
};

export const recipeService = {
  // Public Feed: Shows SQL (Community) + Local Verified + My Pending/Rejected
  getAllRecipes: async (): Promise<Recipe[]> => {
    const currentUser = authService.getUser();

    // 1. Fetch from Local Storage
    const localRecipes = getLocalRecipes();

    // 2. Fetch from SQLite (Community/Static)
    // The "verification method" here is implicit:
    // Any recipe present in the shipped SQLite database is considered verified by the platform.
    const sqlRecipes = await db.getRecipes();
    const sqlNormalized = sqlRecipes.map(r => ({ ...r, status: 'verified' as const }));

    // 3. Filter Local: Verified OR Owned by User
    const validLocal = localRecipes.filter(r => 
      r.status === 'verified' || (currentUser && r.authorId === currentUser.id)
    );

    const allRecipes = [...validLocal, ...sqlNormalized];
    
    // 4. Filter Deleted Recipes (Blocklist)
    const deletedIds = new Set(getDeletedIds().map(String));
    const activeRecipes = allRecipes.filter(r => !deletedIds.has(String(r.id)));
    
    // Remove duplicates by ID
    const seen = new Set();
    return activeRecipes.filter(r => {
      const duplicate = seen.has(r.id);
      seen.add(r.id);
      return !duplicate;
    });
  },

  // Admin Only: Get pending
  getPendingRecipes: (): Recipe[] => {
    const local = getLocalRecipes();
    const deletedIds = new Set(getDeletedIds().map(String));
    return local.filter(r => r.status === 'pending' && !deletedIds.has(String(r.id)));
  },

  getRecipeById: async (id: string): Promise<Recipe | undefined> => {
    // Check if deleted first
    const deletedIds = new Set(getDeletedIds().map(String));
    if (deletedIds.has(String(id))) return undefined;

    const localRecipes = getLocalRecipes();
    const localMatch = localRecipes.find(r => String(r.id) === String(id));
    if (localMatch) return localMatch;

    const sqlMatch = await db.getRecipeById(id);
    if (sqlMatch) return { ...sqlMatch, status: 'verified' };
    
    return undefined;
  },

  create: (recipe: Recipe): void => {
    const recipes = getLocalRecipes();
    const trustedUsers = getTrustedUsers();
    
    // Auto-verify if author is Trusted OR is a Dev
    const isTrusted = trustedUsers.includes(recipe.authorId) || recipe.authorId.startsWith('dev-');
    
    const newRecipe = { 
        ...recipe, 
        status: isTrusted ? 'verified' as const : 'pending' as const 
    };
    
    const updated = [newRecipe, ...recipes];
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const stringId = String(id);
    
    // 1. Remove from local storage array
    const recipes = getLocalRecipes();
    const updated = recipes.filter(r => String(r.id) !== stringId);
    // Always update local storage to reflect the removal or ensure it's not there
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));

    // 2. Add to deleted IDs list (Global Blocklist) for SQL items or just robustness
    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(stringId)) {
        deletedIds.push(stringId);
        localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
    }
  },

  updateStatus: (id: string, status: 'verified' | 'rejected'): void => {
    const recipes = getLocalRecipes();
    const updated = recipes.map(r => String(r.id) === String(id) ? { ...r, status } : r);
    if (status === 'rejected') {
        // If rejected, remove from local and add to blocklist to be safe
        const filtered = recipes.filter(r => String(r.id) !== String(id));
        localStorage.setItem(RECIPE_KEY, JSON.stringify(filtered));
        
        const deletedIds = getDeletedIds();
        if (!deletedIds.includes(String(id))) {
            deletedIds.push(String(id));
            localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
        }
    } else {
        localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
    }
  },

  trustAuthor: (authorId: string): void => {
      const trusted = getTrustedUsers();
      if (!trusted.includes(authorId)) {
          trusted.push(authorId);
          localStorage.setItem(TRUSTED_USERS_KEY, JSON.stringify(trusted));
      }
  },

  isAuthorTrusted: (authorId: string): boolean => {
      return getTrustedUsers().includes(authorId);
  },

  addComment: (recipeId: string, comment: Comment): void => {
    const recipes = getLocalRecipes();
    const updated = recipes.map(r => {
      if (String(r.id) === String(recipeId)) {
        return {
          ...r,
          comments: [...(r.comments || []), comment]
        };
      }
      return r;
    });
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  },

  getMyRating: (recipeId: string): number => {
      const ratings = getUserRatings();
      return ratings[recipeId] || 0;
  },

  rate: (recipeId: string, newRating: number): Recipe | undefined => {
    const recipes = getLocalRecipes();
    const index = recipes.findIndex(r => String(r.id) === String(recipeId));
    
    const userRatings = getUserRatings();
    const previousRating = userRatings[recipeId];
    userRatings[recipeId] = newRating;
    localStorage.setItem(USER_RATINGS_KEY, JSON.stringify(userRatings));

    if (index !== -1) {
      const recipe = recipes[index];
      let currentCount = recipe.ratingCount || 0;
      let currentRating = recipe.rating || 0;
      
      let newTotalScore = currentRating * currentCount;
      let newCount = currentCount;

      if (previousRating) {
          newTotalScore = newTotalScore - previousRating + newRating;
      } else {
          newTotalScore = newTotalScore + newRating;
          newCount = currentCount + 1;
      }

      const calculatedRating = newCount > 0 ? newTotalScore / newCount : 0;

      const updatedRecipe = {
        ...recipe,
        rating: Number(calculatedRating.toFixed(1)),
        ratingCount: newCount
      };

      recipes[index] = updatedRecipe;
      localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes));
      return updatedRecipe;
    }
    
    return undefined; 
  }
};