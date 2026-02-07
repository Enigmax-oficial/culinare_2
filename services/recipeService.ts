import { Recipe } from '../types';

const RECIPE_KEY = 'chef_em_casa_recipes';

const SEED_DATA: Recipe[] = [
  {
    id: '1',
    title: 'Bolo de Chocolate Cremoso',
    description: 'Um bolo delicioso e fácil de fazer, perfeito para o lanche da tarde.',
    image: 'https://picsum.photos/id/292/800/600',
    category: 'Sobremesa',
    prepTime: 20,
    cookTime: 40,
    difficulty: 'Fácil',
    ingredients: [{ id: '1', name: '3 ovos' }, { id: '2', name: '1 xícara de chocolate em pó' }],
    steps: [{ id: '1', text: 'Misture tudo e asse por 40min.' }],
    authorId: 'system',
    authorName: 'Chef Em Casa',
    createdAt: Date.now(),
    rating: 4
  }
];

export const recipeService = {
  getAll: (): Recipe[] => {
    const stored = localStorage.getItem(RECIPE_KEY);
    if (!stored) {
      localStorage.setItem(RECIPE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(stored);
  },

  getById: (id: string): Recipe | undefined => {
    const recipes = recipeService.getAll();
    return recipes.find(r => r.id === id);
  },

  create: (recipe: Recipe): void => {
    const recipes = recipeService.getAll();
    const updated = [recipe, ...recipes];
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  },

  delete: (id: string): void => {
    const recipes = recipeService.getAll();
    const updated = recipes.filter(r => r.id !== id);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  }
};