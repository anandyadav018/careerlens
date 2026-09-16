import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state by attempting to fetch the profile
  // The axios response interceptor will automatically try to refresh the token if needed
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.getProfile();
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for custom logout event from axios interceptor (e.g. refresh failed)
    const handleForceLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const { user, accessToken } = response.data;
    
    setAccessToken(accessToken);
    setUser(user);
    setIsAuthenticated(true);
    
    return user;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authApi.register(userData);
    const { user, accessToken } = response.data;
    
    setAccessToken(accessToken);
    setUser(user);
    setIsAuthenticated(true);
    
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
