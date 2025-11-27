import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

const mapUserPayload = (payload = {}) => ({
  id: payload.id,
  name: payload.name,
  email: payload.email,
  role: payload.role,
  accountStatus: payload.accountStatus || 'APPROVED',
  approvalRequested: payload.approvalRequested ?? false,
  rejectionCount: payload.rejectionCount ?? 0,
  lastRejectionReason: payload.lastRejectionReason || null,
});

const normalizeStoredUser = (storedUser = {}) => ({
  accountStatus: 'APPROVED',
  approvalRequested: false,
  rejectionCount: 0,
  lastRejectionReason: null,
  ...storedUser,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');

    if (token && stored) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const parsed = normalizeStoredUser(JSON.parse(stored));
      setUser(parsed);
      localStorage.setItem('user', JSON.stringify(parsed));
    }
    setLoading(false);
  }, []);

  const persistUser = (nextUser) => {
    const normalized = normalizeStoredUser(nextUser);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      const { token } = response.data;
      const mappedUser = mapUserPayload(response.data);

      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      persistUser(mappedUser);

      return { success: true, user: mappedUser };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/users/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (partialUser) => {
    if (!partialUser) return;
    setUser((prev) => {
      const merged = normalizeStoredUser({
        ...(prev || {}),
        ...partialUser,
      });
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshUserFromServer = async () => {
    if (!user) return null;
    try {
      const response = await apiClient.get(`/users/${user.id}`);
      return persistUser(mapUserPayload(response.data));
    } catch (error) {
      console.error('Failed to refresh user profile', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUserFromServer,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
