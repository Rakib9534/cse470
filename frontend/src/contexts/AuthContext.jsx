import { createContext, useContext, useState, useEffect, useRef } from 'react';
import AuthController from '../controllers/AuthController.js';
import UserModel from '../models/UserModel.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Create controller instance
  const authControllerRef = useRef(new AuthController());
  const authController = authControllerRef.current;

  const [user, setUser] = useState(() => {
    // Load user from localStorage on mount
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        const userModel = new UserModel(userData);
        authController.currentUser = userModel;
        return userModel;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user.toJSON()));
      setIsAuthenticated(true);
      authController.currentUser = user;
    } else {
      localStorage.removeItem('currentUser');
      setIsAuthenticated(false);
      authController.currentUser = null;
    }
  }, [user, authController]);

  const login = async (email, password, role) => {
    const result = await authController.login(email, password, role);
    if (result.success) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Invalid credentials' };
  };

  const register = async (userData) => {
    try {
      const result = await authController.register(userData);
      if (result.success) {
        setUser(result.user);
        return true;
      } else {
        // Log error for debugging
        console.error('Registration error:', result.error);
        // You could also set an error state here if needed
        return false;
      }
    } catch (error) {
      console.error('Registration exception:', error);
      return false;
    }
  };

  const logout = () => {
    authController.logout();
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
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

