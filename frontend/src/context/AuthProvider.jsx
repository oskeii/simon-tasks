import React, { createContext, useState } from 'react'

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});

  const login = (username) => {
    setAuth({
      username: username,
      aT: true,
      rT: true
    });
  }


  return (
    <AuthContext.Provider value={{ auth, setAuth, login }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;