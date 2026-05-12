import { create } from 'zustand';
import api from '../lib/api';
import { io } from 'socket.io-client';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,

  initSocket: (userId) => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.emit('join_user', userId);
    
    socket.on('new_notification', (notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
    });

    set({ socket });
  },

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ 
        notifications: data,
        unreadCount: data.filter(n => !n.isRead).length
      });
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  },

  markOneAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {
      console.error('Failed to mark one as read', err);
    }
  }
}));
