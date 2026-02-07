import { User } from '../types';

const STORAGE_KEY = 'chef_em_casa_user';

export const authService = {
  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (email: string, password?: string): Promise<User | null> => {
    // Hardcoded DEV User
    if (email === 'ruan@dev' && password === 'test') {
      const devUser: User = {
        id: 'dev-ruan',
        name: 'Ruan Dev',
        email: 'ruan@dev',
        type: 'email',
        role: 'dev',
        avatar: 'https://ui-avatars.com/api/?name=Ruan+Dev&background=10b981&color=fff'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devUser));
      return devUser;
    }

    // Local Storage Check
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      // In a real app we would check password hash here
      if (user.email === email) return user;
    }
    return null;
  },

  createUser: async (name: string, email: string, type: 'google' | 'email'): Promise<User> => {
    // HARDCODED DEV ACCESS FOR DEMO
    const role = (email.toLowerCase() === 'dev@chefemcasa.com' || email.toLowerCase() === 'ruan@dev') ? 'dev' : 'user';

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};