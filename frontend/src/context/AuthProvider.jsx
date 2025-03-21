import React, { createContext, useState } from 'react'

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const login = (userData) => {
    setAuth({
      user: userData,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };


  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;