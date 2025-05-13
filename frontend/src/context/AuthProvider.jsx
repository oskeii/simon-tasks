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
      const success = await authService.refreshToken();
      
      if (success && !auth.isAuthenticated) { // token refresh was successful
          setAuth(prev => ({...prev, isAuthenticated: true}));
      }
      // Handle unsuccessful refresh (API returned failure)
      if (!auth.isAuthenticated) {await logout();}
      return success;

    } catch (err) {
      // Handle refresh exceptions (network error, etc.)
      console.error("Token refresh failed:", err);
      await logout();
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

  }, [auth.isAuthenticated, authService])

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