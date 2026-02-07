import { Notification, User } from '../types';
import { authService } from './authService';

const NOTIFICATIONS_KEY = 'chef_em_casa_notifications';

const getStoredNotifications = (): Notification[] => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const notificationService = {
    getNotificationsForUser: (userId: string): Notification[] => {
        const all = getStoredNotifications();
        return all.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    },

    create: (userId: string, title: string, message: string, type: 'system' | 'recipe_update' | 'dev_announcement') => {
        // Logic to check preferences would happen here in a real backend.
        // For this local demo, we simulate checking the current user's prefs if they match the ID,
        // otherwise we just push it (simulating the server sending it).
        
        const currentUser = authService.getUser();
        
        // If sending to current user, check their prefs immediately
        if (currentUser && currentUser.id === userId && currentUser.preferences) {
             if (type === 'recipe_update' && !currentUser.preferences.recipeUpdates) {
                 return; // User blocked this type
             }
             // Dev announcements cannot be blocked
        }

        const newNote: Notification = {
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

    markAsRead: (notificationId: string) => {
        const all = getStoredNotifications();
        const updated = all.map(n => n.id === notificationId ? { ...n, read: true } : n);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }
};