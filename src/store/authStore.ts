import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => Promise<void>;

  // Derived helpers
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true, // Start as loading until we check auth
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  signOut: async () => {
    if (!supabase) return;

    set({ isLoading: true, error: null });

    const { error } = await supabase.auth.signOut();

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ user: null, session: null, isLoading: false });
    }
  },

  isAuthenticated: () => {
    const { user } = get();
    return user !== null;
  },
}));
