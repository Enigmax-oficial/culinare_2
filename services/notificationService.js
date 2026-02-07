import { authService } from './authService';

const NOTIFICATIONS_KEY = 'chef_em_casa_notifications';

const getStoredNotifications = () => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const notificationService = {
    getNotificationsForUser: (userId) => {
        const all = getStoredNotifications();
        return all.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    },

    create: (userId, title, message, type) => {
        const currentUser = authService.getUser();
        if (currentUser && currentUser.id === userId && currentUser.preferences) {
             if (type === 'recipe_update' && !currentUser.preferences.recipeUpdates) {
                 return;
             }
        }

        const newNote = {
            id: crypto.randomUUID(),
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: Date.now()
        };

        const all = getStoredNotifications();
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newNote, ...all]));
    },

    markAsRead: (notificationId) => {
        const all = getStoredNotifications();
        const updated = all.map(n => n.id === notificationId ? { ...n, read: true } : n);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }
};
import { authService } from './authService';

const NOTIFICATIONS_KEY = 'chef_em_casa_notifications';

const getStoredNotifications = () => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const notificationService = {
    getNotificationsForUser: (userId) => {
        const all = getStoredNotifications();
        return all.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    },

    create: (userId, title, message, type) => {
        const currentUser = authService.getUser();
        if (currentUser && currentUser.id === userId && currentUser.preferences) {
             if (type === 'recipe_update' && !currentUser.preferences.recipeUpdates) {
                 return;
             }
        }

        const newNote = {
            id: crypto.randomUUID(),
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: Date.now()
        };

        const all = getStoredNotifications();
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newNote, ...all]));
    },

    markAsRead: (notificationId) => {
        const all = getStoredNotifications();
        const updated = all.map(n => n.id === notificationId ? { ...n, read: true } : n);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }
};
