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
  loginWithBackend: (emailOrId: string, passwordOrOtp?: string) => Promise<{ success: boolean; role?: UserRole; message?: string }>;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  register: (user: MockUser, role: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  canAccessRole: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bhu_drishti_auth_session';
const REGISTERED_USERS_KEY = 'bhu_registered_users_db';

// Authorized Government & Officer Credentials Registry (Unique per Actor)
const AUTHORIZED_ACCOUNTS: Record<string, { role: UserRole; password: string }> = {
  // 1. Requisite Agency (NHAI)
  'agency@nhai.gov.in': { role: 'AGENCY', password: 'Agency@123' },
  'agency@gov.in': { role: 'AGENCY', password: 'Agency@123' },
  'agency': { role: 'AGENCY', password: 'Agency@123' },

  // 2. Land Acquisition Officer (LAO)
  'lao.pune@revenue.gov.in': { role: 'LAO', password: 'LAO@123' },
  'lao@gov.in': { role: 'LAO', password: 'LAO@123' },
  'lao': { role: 'LAO', password: 'LAO@123' },

  // 3. Forest & Environment Officer (DFO)
  'dfo.forest@moefcc.gov.in': { role: 'FOREST', password: 'Forest@123' },
  'forest@gov.in': { role: 'FOREST', password: 'Forest@123' },
  'forest': { role: 'FOREST', password: 'Forest@123' },

  // 4. District Collector (IAS)
  'collector.nagpur@gov.in': { role: 'COLLECTOR', password: 'Collector@123' },
  'collector@gov.in': { role: 'COLLECTOR', password: 'Collector@123' },
  'collector': { role: 'COLLECTOR', password: 'Collector@123' },

  // 5. Revenue Court / Tehsildar
  'tehsildar.court@revenue.gov.in': { role: 'TEHSILDAR', password: 'Tehsildar@123' },
  'tehsildar@gov.in': { role: 'TEHSILDAR', password: 'Tehsildar@123' },
  'tehsildar': { role: 'TEHSILDAR', password: 'Tehsildar@123' },

  // 6. Citizen / Landowner
  'citizen@gov.in': { role: 'CITIZEN', password: 'Citizen@123' },
  'citizen': { role: 'CITIZEN', password: 'Citizen@123' },
};

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
    setAuthState((prev) => ({ ...prev, isLoaded: true }));
  }, []);

  // Strict Authentication Login (Calls backend API, falls back to authorized registry with strict password check)
  const loginWithBackend = async (
    emailOrId: string,
    passwordOrOtp?: string
  ): Promise<{ success: boolean; role?: UserRole; message?: string }> => {
    const identifier = emailOrId.trim().toLowerCase();
    const providedPassword = passwordOrOtp || '';

    // 1. Try FastAPI backend authentication endpoint
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login` : '/api/v1/auth/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_id: identifier,
          password_or_otp: providedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const role = data.role as UserRole;
        const user = data.user as MockUser;
        const token = data.token;

        const newState: AuthState = {
          user,
          role,
          token,
          isAuthenticated: true,
          isLoaded: true,
        };

        setAuthState(newState);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role, token, customUser: user }));
        return { success: true, role };
      } else if (response.status === 401) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, message: errData.detail || 'Incorrect User ID or Password.' };
      }
    } catch (err) {
      console.warn('Backend API offline, evaluating against authorized credentials registry:', err);
    }

    // 2. Check Static Official Accounts Registry
    if (AUTHORIZED_ACCOUNTS[identifier]) {
      const account = AUTHORIZED_ACCOUNTS[identifier];
      if (account.password === providedPassword) {
        const config = ROLE_CONFIGS[account.role];
        const token = `jwt-token-verified-${account.role.toLowerCase()}-${Date.now()}`;
        const newState: AuthState = {
          user: config.user,
          role: account.role,
          token,
          isAuthenticated: true,
          isLoaded: true,
        };

        setAuthState(newState);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: account.role, token, customUser: config.user }));
        return { success: true, role: account.role };
      } else {
        return { success: false, message: 'Invalid password provided for this account.' };
      }
    }

    // 3. Check Registered Citizen Database in localStorage
    try {
      const registeredJson = localStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredJson) {
        const registeredUsers: Record<string, { user: MockUser; role: UserRole; password: string }> = JSON.parse(registeredJson);
        if (registeredUsers[identifier]) {
          const record = registeredUsers[identifier];
          if (record.password === providedPassword) {
            const token = `jwt-token-registered-citizen-${Date.now()}`;
            const newState: AuthState = {
              user: record.user,
              role: record.role,
              token,
              isAuthenticated: true,
              isLoaded: true,
            };

            setAuthState(newState);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: record.role, token, customUser: record.user }));
            return { success: true, role: record.role };
          } else {
            return { success: false, message: 'Invalid password for registered citizen account.' };
          }
        }
      }
    } catch (e) {
      console.error('Error reading registered users database:', e);
    }

    // If identifier is not found in any authorized registry:
    return { success: false, message: 'User account not found. Please verify your User ID / email address or register as a citizen.' };
  };

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

  const register = async (newUser: MockUser, selectedRole: UserRole, password?: string): Promise<boolean> => {
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
      
      // Save to registered citizens database in localStorage
      const userKey = newUser.email ? newUser.email.toLowerCase() : (newUser.aadhaar || 'citizen');
      const existing = localStorage.getItem(REGISTERED_USERS_KEY);
      const db = existing ? JSON.parse(existing) : {};
      db[userKey] = {
        user: newUser,
        role: selectedRole,
        password: password || 'password123',
      };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save registered user:', e);
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
    <AuthContext.Provider value={{ ...authState, loginWithBackend, login, register, logout, canAccessRole }}>
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

export { ROLE_CONFIGS };
