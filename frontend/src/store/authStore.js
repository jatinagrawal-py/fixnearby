//frontend/store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  repairer: null,
  user: null,
  admin: null,
  token: null,
  role: null,
  isLoading: true,

  setRepairer: (repairerData) => set({
    repairer: repairerData,
    token: repairerData?.token || null,
    role: 'repairer'
  }),

  clearRepairer: () => set({ repairer: null, token: null, role: null }),

  setUser: (userData) => set({
    user: userData,
    token: userData?.token || null,
    role: 'user'
  }),

  clearUser: () => set({ user: null, token: null, role: null }),

  setAdmin: (adminData) => set({
    admin: adminData,
    token: adminData?.token || null,
    role: 'admin'
  }),

  clearAdmin: () => set({ admin: null, token: null, role: null }),

  setIsLoading: (status) => set({ isLoading: status }),

  logout: () => {
    set({ repairer: null, user: null, admin: null, token: null, role: null, isLoading: false });
  },
}));
