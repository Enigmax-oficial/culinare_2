export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: 'google' | 'email';
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface Step {
  id: string;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  prepTime: number;
  cookTime: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  ingredients: Ingredient[];
  steps: Step[];
  authorId: string;
  authorName: string;
  createdAt: number;
  rating?: number;
}

export type Category = 'Todas' | 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Sobremesa' | 'Lanche' | 'Bebida';

export const CATEGORIES: Category[] = ['Todas', 'Café da Manhã', 'Almoço', 'Jantar', 'Sobremesa', 'Lanche', 'Bebida'];
