export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: 'google' | 'email';
  role: 'user' | 'dev';
}

export interface Ingredient {
  id: string;
  name: string;
}

export interface Step {
  id: string;
  text: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: number;
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
  status: 'pending' | 'verified' | 'rejected';
  comments?: Comment[];
}

export type Category = 'Todas' | 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Sobremesa' | 'Lanche' | 'Bebida';

export const CATEGORIES: Category[] = ['Todas', 'Café da Manhã', 'Almoço', 'Jantar', 'Sobremesa', 'Lanche', 'Bebida'];

export interface SearchFilters {
  difficulty: string;
  maxTime: number;
}