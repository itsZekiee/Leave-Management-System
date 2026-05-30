import { useState, useCallback } from 'react';

/**
 * Custom hook for managing authentication state and transitions.
 * Skill: Hook Architecture
 */
export const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ login_id: loginId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.login_id?.[0] || 'Login failed');
      }

      const { user, access_token, redirect } = data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      // Use the redirect provided by the backend
      window.location.href = redirect;

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.corporate_id?.startsWith('ad-'),
  };
};
