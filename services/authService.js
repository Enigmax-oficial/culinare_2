const STORAGE_KEY = 'chef_em_casa_user';

export const authService = {
  getUser: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  login: async (email, password) => {
    if (email === 'ruan@dev' && password === 'test') {
      const devUser = {
        id: 'dev-ruan',
        name: 'Ruan Dev',
        email: 'ruan@dev',
        type: 'email',
        role: 'dev',
        avatar: 'https://ui-avatars.com/api/?name=Ruan+Dev&background=10b981&color=fff',
        preferences: {
            recipeUpdates: true,
            marketing: false
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devUser));
      return devUser;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }
    return null;
  },

  createUser: async (name, email, type) => {
    const role = (email.toLowerCase() === 'dev@chefemcasa.com' || email.toLowerCase() === 'ruan@dev') ? 'dev' : 'user';

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`,
      preferences: {
        recipeUpdates: true,
        marketing: true
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
const STORAGE_KEY = 'chef_em_casa_user';

export const authService = {
  getUser: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  login: async (email, password) => {
    // Hardcoded DEV User
    if (email === 'ruan@dev' && password === 'test') {
      const devUser = {
        id: 'dev-ruan',
        name: 'Ruan Dev',
        email: 'ruan@dev',
        type: 'email',
        role: 'dev',
        avatar: 'https://ui-avatars.com/api/?name=Ruan+Dev&background=10b981&color=fff',
        preferences: {
            recipeUpdates: true,
            marketing: false
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devUser));
      return devUser;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }
    return null;
  },

  createUser: async (name, email, type) => {
    const role = (email.toLowerCase() === 'dev@chefemcasa.com' || email.toLowerCase() === 'ruan@dev') ? 'dev' : 'user';

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`,
      preferences: {
        recipeUpdates: true,
        marketing: true
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
const STORAGE_KEY = 'chef_em_casa_user';

export const authService = {
  getUser: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  updateUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  login: async (email, password) => {
    if (email === 'ruan@dev' && password === 'test') {
      const devUser = {
        id: 'dev-ruan',
        name: 'Ruan Dev',
        email: 'ruan@dev',
        type: 'email',
        role: 'dev',
        avatar: 'https://ui-avatars.com/api/?name=Ruan+Dev&background=10b981&color=fff',
        preferences: {
            recipeUpdates: true,
            marketing: false
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(devUser));
      return devUser;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      if (user.email === email) return user;
    }
    return null;
  },

  createUser: async (name, email, type) => {
    const role = (email.toLowerCase() === 'dev@chefemcasa.com' || email.toLowerCase() === 'ruan@dev') ? 'dev' : 'user';

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      type,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`,
      preferences: {
        recipeUpdates: true,
        marketing: true
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
