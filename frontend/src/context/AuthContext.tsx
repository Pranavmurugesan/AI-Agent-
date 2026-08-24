import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Organization, LoginRequest, RegisterRequest } from '../types/api';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initializes CSRF token and verifies session state against /api/v1/users/me.
   * Authentication is exclusively backed by HttpOnly cookie jwt_token.
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Initialize CSRF protection token
      await apiService.getCsrfToken();

      // Step 2: Query authenticated user profile
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);

      if (currentUser.organization) {
        setOrganization(currentUser.organization);
      } else {
        try {
          const currentOrg = await apiService.getCurrentOrganization();
          setOrganization(currentOrg);
        } catch {
          // Organization might be embedded directly in user
        }
      }
    } catch {
      // Unauthenticated session or expired token - graceful fallback to unauthenticated state
      setUser(null);
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure CSRF token is warm before mutating request
      await apiService.getCsrfToken();
      const response = await apiService.login(credentials);
      setUser(response.user);
      if (response.user.organization) {
        setOrganization(response.user.organization);
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify institute credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.getCsrfToken();
      const response = await apiService.register(data);
      setUser(response.user);
      if (response.user.organization) {
        setOrganization(response.user.organization);
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please check form details.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      setOrganization(null);
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
