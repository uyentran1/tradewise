import React, { createContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user = { id, email, fullName }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        // Check if token is a temporary verification token
        if (decoded.tempVerification) {
          console.warn('Temporary verification token found, clearing...');
          localStorage.removeItem('token');
          return;
        }
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          console.warn('Token expired, clearing...');
          localStorage.removeItem('token');
          return;
        }
        
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      
      // Don't allow temporary verification tokens to be stored as regular login
      if (decoded.tempVerification) {
        console.error('Cannot login with temporary verification token');
        return false;
      }
      
      localStorage.setItem('token', token);
      setUser(decoded);
      return true;
    } catch (err) {
      console.error('Invalid token provided to login:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};