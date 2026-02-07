import { User } from '../types';

const STORAGE_KEY = 'chef_em_casa_user';

export const authService = {
  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (email: string): Promise<User | null> => {
    // In a real app, this would hit an API. 
    // Here, we check if this email was "registered" locally before.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }
    return null;
  },

  createUser: async (name: string, email: string, type: 'google' | 'email'): Promise<User> => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};