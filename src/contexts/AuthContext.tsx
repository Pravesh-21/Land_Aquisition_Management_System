'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserRole, MockUser } from '@/types';
import { ROLE_CONFIGS } from '@/contexts/RoleContext';

interface AuthState {
  user: MockUser | null;
  role: UserRole | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoaded: boolean;
}

interface AuthContextType extends AuthState {
  loginWithBackend: (emailOrId: string, passwordOrOtp?: string) => Promise<{ success: boolean; role?: UserRole; message?: string; requiresVerification?: boolean }>;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  register: (user: MockUser, role: UserRole, password?: string) => Promise<{ success: boolean; requiresVerification?: boolean; message?: string }>;
  logout: () => void;
  canAccessRole: (requiredRole: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  changePassword: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  revokeAllSessions: () => Promise<{ success: boolean; message: string }>;
  getUserSessions: () => Promise<any[]>;
  sendVerificationOtp: (channel: 'EMAIL' | 'WHATSAPP') => Promise<{ success: boolean; maskedDestination?: string; cooldown?: number; message?: string }>;
  verifyOtp: (channel: 'EMAIL' | 'WHATSAPP', otp: string) => Promise<{ success: boolean; user?: any; message?: string }>;
  resendOtp: (channel: 'EMAIL' | 'WHATSAPP') => Promise<{ success: boolean; maskedDestination?: string; cooldown?: number; message?: string }>;
  getVerificationStatus: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bhu_drishti_auth_session';
const ACCESS_TOKEN_KEY = 'bhu_access_token';
const REFRESH_TOKEN_KEY = 'bhu_refresh_token';

// Helper to determine API base URL
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    token: null,
    permissions: [],
    isAuthenticated: false,
    isLoaded: false,
  });

  // Map backend user summary to frontend MockUser format
  const mapBackendUser = useCallback((backendUser: any, primaryRole: UserRole): MockUser => {
    const config = ROLE_CONFIGS[primaryRole];
    return {
      name: backendUser.full_name || (config ? config.user.name : 'Officer'),
      designation: config ? config.user.designation : 'Authorized Officer',
      department: backendUser.departments?.length ? backendUser.departments.join(', ') : (config ? config.user.department : 'Government of India'),
      email: backendUser.email,
      phone: backendUser.phone || undefined,
      is_verified: backendUser.is_verified ?? false,
    };
  }, []);

  // Restore authenticated session from backend on page load / reload
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!storedAccessToken && !storedRefreshToken) {
          setAuthState((prev) => ({ ...prev, isLoaded: true }));
          return;
        }

        // 1. Validate access token against /api/v1/auth/me
        if (storedAccessToken) {
          try {
            const meRes = await fetch(`${getApiBaseUrl()}/api/v1/auth/me`, {
              headers: { Authorization: `Bearer ${storedAccessToken}` },
              credentials: 'include',
            });

            if (meRes.ok) {
              const userData = await meRes.json();
              const primaryRole = (userData.roles && userData.roles[0] ? userData.roles[0].toUpperCase() : 'CITIZEN') as UserRole;
              const userProfile = mapBackendUser(userData, primaryRole);

              setAuthState({
                user: userProfile,
                role: primaryRole,
                token: storedAccessToken,
                permissions: userData.permissions || [],
                isAuthenticated: true,
                isLoaded: true,
              });
              return;
            }
          } catch (e) {
            console.warn('Network error checking current session:', e);
          }
        }

        // 2. Access token expired or invalid -> Attempt refresh rotation (via payload or HttpOnly cookie)
        try {
          const refreshRes = await fetch(`${getApiBaseUrl()}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ refresh_token: storedRefreshToken || undefined }),
          });

          if (refreshRes.ok) {
            const tokenData = await refreshRes.json();
            const primaryRole = (tokenData.user.roles && tokenData.user.roles[0] ? tokenData.user.roles[0].toUpperCase() : 'CITIZEN') as UserRole;
            const userProfile = mapBackendUser(tokenData.user, primaryRole);

            localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.access_token);
            if (tokenData.refresh_token) {
              localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token);
            }

            setAuthState({
              user: userProfile,
              role: primaryRole,
              token: tokenData.access_token,
              permissions: tokenData.user.permissions || [],
              isAuthenticated: true,
              isLoaded: true,
            });
            return;
          }
        } catch (e) {
          console.warn('Failed to refresh token session:', e);
        }

        // 3. If tokens are invalid or expired, clear storage
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        setAuthState((prev) => ({ ...prev, isLoaded: true }));
      }
    };

    restoreSession();
  }, [mapBackendUser]);

  // Production Login: Authenticate against FastAPI + PostgreSQL Backend
  const loginWithBackend = async (
    emailOrId: string,
    passwordOrOtp?: string
  ): Promise<{ success: boolean; role?: UserRole; message?: string; requiresVerification?: boolean }> => {
    const identifier = emailOrId.trim();
    const providedPassword = passwordOrOtp || '';

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: identifier,
          password: providedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const primaryRole = (data.user.roles && data.user.roles[0] ? data.user.roles[0].toUpperCase() : 'CITIZEN') as UserRole;
        const userProfile = mapBackendUser(data.user, primaryRole);

        // Store tokens securely in browser storage
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: primaryRole, user: userProfile }));

        setAuthState({
          user: userProfile,
          role: primaryRole,
          token: data.access_token,
          permissions: data.user.permissions || [],
          isAuthenticated: true,
          isLoaded: true,
        });

        // If Citizen account is unverified, inform the login flow to prompt verification
        if (primaryRole === 'CITIZEN' && !data.user.is_verified) {
          return {
            success: true,
            role: primaryRole,
            requiresVerification: true,
            message: 'Account verification required before dashboard access.',
          };
        }

        return { success: true, role: primaryRole };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errData.detail || 'Invalid credentials. Please verify your User ID and Password.',
        };
      }
    } catch (err) {
      console.error('Authentication service connection error:', err);
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure the backend is running.',
      };
    }
  };

  // Helper login for development/quick-switch testing
  const login = async (selectedRole: UserRole, email?: string, password?: string): Promise<boolean> => {
    const fallbackEmail = email || `${selectedRole.toLowerCase()}@gov.in`;
    const fallbackPassword = password || `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).toLowerCase()}@123`;
    const res = await loginWithBackend(fallbackEmail, fallbackPassword);
    return res.success;
  };

  // Public Citizen Registration via Backend
  const register = async (
    newUser: MockUser,
    selectedRole: UserRole,
    password?: string
  ): Promise<{ success: boolean; requiresVerification?: boolean; message?: string }> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: password || 'Citizen@123',
          role: 'CITIZEN',
          phone: newUser.phone || null,
          aadhaar_or_id: newUser.aadhaar || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const primaryRole: UserRole = 'CITIZEN';
        const userProfile = mapBackendUser(data.user, primaryRole);

        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: primaryRole, user: userProfile }));

        setAuthState({
          user: userProfile,
          role: primaryRole,
          token: data.access_token,
          permissions: data.user.permissions || [],
          isAuthenticated: true,
          isLoaded: true,
        });

        return {
          success: true,
          requiresVerification: true,
          message: 'Account created. Please verify your contact to continue.',
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errData.detail || 'Citizen registration failed.',
        };
      }
    } catch (err) {
      console.error('Citizen registration error:', err);
      return {
        success: false,
        message: 'Network error submitting registration.',
      };
    }
  };

  // --- Verification API Methods ---
  const sendVerificationOtp = async (
    channel: 'EMAIL' | 'WHATSAPP'
  ): Promise<{ success: boolean; maskedDestination?: string; cooldown?: number; message?: string }> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ channel }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          success: true,
          maskedDestination: data.masked_destination,
          cooldown: data.cooldown_seconds || 60,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to dispatch verification code.',
        };
      }
    } catch (err) {
      return { success: false, message: 'Network error requesting verification code.' };
    }
  };

  const verifyOtp = async (
    channel: 'EMAIL' | 'WHATSAPP',
    otp: string
  ): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ channel, otp }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Update user state to verified
        if (authState.user) {
          const updatedUser: MockUser = { ...authState.user, is_verified: true };
          setAuthState((prev) => ({ ...prev, user: updatedUser }));
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: authState.role, user: updatedUser }));
        }
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.detail || 'OTP verification failed.' };
      }
    } catch (err) {
      return { success: false, message: 'Network error validating verification code.' };
    }
  };

  const resendOtp = async (
    channel: 'EMAIL' | 'WHATSAPP'
  ): Promise<{ success: boolean; maskedDestination?: string; cooldown?: number; message?: string }> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ channel }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return {
          success: true,
          maskedDestination: data.masked_destination,
          cooldown: data.cooldown_seconds || 60,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to resend code.',
        };
      }
    } catch (err) {
      return { success: false, message: 'Network error resending verification code.' };
    }
  };

  const getVerificationStatus = async (): Promise<any> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/verification/status`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  // Self-Service Password Change
  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, message: data.message || 'Password changed successfully.' };
      } else {
        return { success: false, message: data.detail || 'Failed to update password.' };
      }
    } catch (err) {
      return { success: false, message: 'Network error communicating with password service.' };
    }
  };

  // Revoke All Sessions across devices
  const revokeAllSessions = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/revoke-all-sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, message: data.message || 'All sessions revoked.' };
      } else {
        return { success: false, message: data.detail || 'Failed to revoke sessions.' };
      }
    } catch (err) {
      return { success: false, message: 'Network error revoking sessions.' };
    }
  };

  // Get active user sessions
  const getUserSessions = async (): Promise<any[]> => {
    try {
      const token = authState.token || localStorage.getItem(ACCESS_TOKEN_KEY);
      const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch {
      return [];
    }
  };

  // Logout: Revoke refresh token on backend and clear local state
  const logout = async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refresh_token: storedRefreshToken || undefined }),
      });
    } catch (err) {
      console.warn('Error notifying backend of logout:', err);
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    setAuthState({
      user: null,
      role: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoaded: true,
    });
  };

  const canAccessRole = (requiredRole: UserRole): boolean => {
    if (!authState.isAuthenticated || !authState.role) return false;
    if (authState.role === 'ADMIN') return true;
    return authState.role === requiredRole;
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.isAuthenticated) return false;
    if (authState.role === 'ADMIN') return true;
    return authState.permissions.includes(permission.toUpperCase());
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginWithBackend,
        login,
        register,
        logout,
        canAccessRole,
        hasPermission,
        changePassword,
        revokeAllSessions,
        getUserSessions,
        sendVerificationOtp,
        verifyOtp,
        resendOtp,
        getVerificationStatus,
      }}
    >
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
