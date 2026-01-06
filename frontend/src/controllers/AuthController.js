/**
 * Authentication Controller
 * Handles authentication business logic and coordinates between models and views
 */
import UserModel from '../models/UserModel.js';
import { userAPI } from '../services/api.js';

class AuthController {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<{success: boolean, user: UserModel|null, error: string|null}>}
   */
  async register(userData) {
    try {
      const userModel = new UserModel(userData);
      const validationErrors = userModel.validate();
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          user: null,
          error: validationErrors.join(', ')
        };
      }

      // Include password in registration data (not in toJSON for security)
      const registrationData = {
        ...userModel.toJSON(),
        password: userData.password // Include password for registration
      };

      const response = await userAPI.register(registrationData);
      
      if (response.success && response.data) {
        this.currentUser = new UserModel(response.data);
        return {
          success: true,
          user: this.currentUser,
          error: null
        };
      } else {
        // Return more specific error message
        const errorMsg = response.error || response.message || 'Registration failed. Please try again.';
        return {
          success: false,
          user: null,
          error: errorMsg
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        user: null,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role
   * @returns {Promise<{success: boolean, user: UserModel|null, error: string|null}>}
   */
  async login(email, password, role) {
    try {
      if (!email || !password || !role) {
        return {
          success: false,
          user: null,
          error: 'Email, password, and role are required'
        };
      }

      const response = await userAPI.login(email, password, role);
      
      if (response.success) {
        this.currentUser = new UserModel(response.data);
        return {
          success: true,
          user: this.currentUser,
          error: null
        };
      } else {
        return {
          success: false,
          user: null,
          error: response.error || 'Invalid credentials'
        };
      }
    } catch (error) {
      return {
        success: false,
        user: null,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
  }

  /**
   * Get current user
   * @returns {UserModel|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }
}

export default AuthController;

