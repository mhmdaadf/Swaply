import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),

      register: async ({ username, email, password }) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { username, email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ loading: false, error: msg });
          throw new Error(msg);
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ loading: false, error: msg });
          throw new Error(msg);
        }
      },

      googleLogin: async (idToken) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/google-login', { idToken });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            loading: false,
          });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Google Login failed';
          set({ loading: false, error: msg });
          throw new Error(msg);
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, error: null });
      },
    }),
    {
      name: 'swaply-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
