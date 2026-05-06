'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { roleRoutes, getFirstRole } from '@/lib/roles';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  roles: string[];
  activeModule: string;       // currently active role key
  profilePictureUrl: string | null;  // mapped from API's 'imageUrl'
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  /** Update a subset of user fields (merges with existing user) */
  updateUser: (patch: Partial<AuthUser>) => void;
  /** Switch to a different module/role and persist */
  switchModule: (role: string) => void;
  /** Clear all auth state and storage */
  logout: () => void;
  isLoading: boolean;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'authUser';

const persistUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // keep legacy keys for guard/context compatibility
    localStorage.setItem('roles', JSON.stringify(user.roles));
    localStorage.setItem('activeRole', user.activeModule);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('roles');
    localStorage.removeItem('activeRole');
  }
};

const hydrateUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthUser;
    // fallback: reconstruct from legacy keys
    const rolesRaw = localStorage.getItem('roles');
    const activeRole = localStorage.getItem('activeRole');
    if (rolesRaw && activeRole) {
      const roles: string[] = JSON.parse(rolesRaw);
      return { id: '', name: '', email: null, roles, activeModule: activeRole, profilePictureUrl: null };
    }
  } catch { /* ignore */ }
  return null;
};

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setUserState(hydrateUser());
    setIsLoading(false);
  }, []);

  const setUser = useCallback((newUser: AuthUser | null) => {
    setUserState(newUser);
    persistUser(newUser);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      persistUser(updated);
      return updated;
    });
  }, []);

  const switchModule = useCallback((role: string) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, activeModule: role };
      persistUser(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    persistUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, switchModule, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─── Convenience selectors ────────────────────────────────────────────────────

/** Returns the initials from a name string (up to 2 chars) */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
