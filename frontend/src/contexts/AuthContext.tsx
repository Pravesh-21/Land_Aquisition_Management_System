'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, MockUser } from '@/types';
import { ROLE_CONFIGS } from '@/contexts/RoleContext';

interface AuthState {
  user: MockUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  register: (user: MockUser, role: UserRole) => Promise<boolean>;
  logout: () => void;
  canAccessRole: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bhu_drishti_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    token: null,
    isAuthenticated: false,
    isLoaded: false,
  });

  // Restore session from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && ROLE_CONFIGS[parsed.role as UserRole]) {
          const user = parsed.customUser || ROLE_CONFIGS[parsed.role as UserRole].user;
          setAuthState({
            user,
            role: parsed.role as UserRole,
            token: parsed.token || `mock-jwt-token-${parsed.role.toLowerCase()}`,
            isAuthenticated: true,
            isLoaded: true,
          });
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    setAuthState(prev => ({ ...prev, isLoaded: true }));
  }, []);

  const login = async (selectedRole: UserRole, email?: string, password?: string): Promise<boolean> => {
    const config = ROLE_CONFIGS[selectedRole];
    if (!config) return false;

    const token = `jwt-${selectedRole.toLowerCase()}-${Date.now()}`;
    const newState: AuthState = {
      user: config.user,
      role: selectedRole,
      token,
      isAuthenticated: true,
      isLoaded: true,
    };

    setAuthState(newState);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: selectedRole, token, customUser: config.user }));
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
    return true;
  };

  const register = async (newUser: MockUser, selectedRole: UserRole): Promise<boolean> => {
    const token = `jwt-registered-${selectedRole.toLowerCase()}-${Date.now()}`;
    const newState: AuthState = {
      user: newUser,
      role: selectedRole,
      token,
      isAuthenticated: true,
      isLoaded: true,
    };

    setAuthState(newState);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: selectedRole, token, customUser: newUser }));
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoaded: true,
    });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  };

  const canAccessRole = (requiredRole: UserRole): boolean => {
    return authState.isAuthenticated && authState.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, canAccessRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
