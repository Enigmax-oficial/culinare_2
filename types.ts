export interface NotificationPreferences {
  recipeUpdates: boolean;
  marketing: boolean;
  // developerAnnouncements are always true (hidden from UI toggle)
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'system' | 'recipe_update' | 'dev_announcement';
  read: boolean;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: 'google' | 'email';
  role: 'user' | 'dev';
  preferences?: NotificationPreferences;
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
  ratingCount?: number;
  status: 'pending' | 'verified' | 'rejected';
  comments?: Comment[];
}

export type Category = 'Todas' | 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Sobremesa' | 'Lanche' | 'Bebida';

export const CATEGORIES: Category[] = ['Todas', 'Café da Manhã', 'Almoço', 'Jantar', 'Sobremesa', 'Lanche', 'Bebida'];

export interface SearchFilters {
  difficulty: string;
  maxTime: number;
}