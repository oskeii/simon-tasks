import React, { createContext, useState, useEffect } from 'react'
import useAuthService from '../hooks/useAuthService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false
  });

  // Get auth API functions
  const authService = useAuthService();

  // Login state update
  const login = (userData) => {
    setAuth({
      user: userData,
      isAuthenticated: true
    });
  };

  // Logout state update
  const logout = async () => {
    try {
      await authService.logoutFromServer();
    } catch (err) {
      console.error("Logout API call failed:", err);
      // Continue with logout even if API call fails
    } finally {
      setAuth({
        user: null,
        isAuthenticated: false
      });
    }
  };

  const refreshToken = async () => {
    try {
      // 1. Try to refresh the token
      const tokenSuccess = await authService.refreshToken();
      
      if (!tokenSuccess) { // Token refresh failed, logout and return false
        if (auth.isAuthenticated) await logout();
        return false;
      }

      // 2. Token is valid, handle user data
      if (!auth.user) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          login(userData);
          return true;
        }
      }

      // 3. We have valid token, ensure authentication flag is set
      if (!auth.isAuthenticated) { setAuth(prev => ({...prev, isAuthenticated: true})); }

      return true;

    } catch (err) {
      // Handle any errors (log out and return false)
      console.error("Token refresh failed:", err);
      if (auth.isAuthenticated) { await logout(); }
      return false;
    }
  };

  
  // Set timer for token
  useEffect(() => {
    let refreshTimer = null;

    if (auth.isAuthenticated) {

      refreshTimer = setInterval(async () => {
        console.log("Proactive token refresh attempt");
        const success = await authService.refreshToken();

        if (!success) {
          // if timer-based refresh fails, logout
          await authService.logoutFromServer();
          logout();
        }
      }, 25*60*1000); // 25 minutes (5min before expiration)
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };

  }, [auth.isAuthenticated])

  return (
    <AuthContext.Provider value={{ 
      auth, 
      setAuth, 
      login, 
      logout,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;