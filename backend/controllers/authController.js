import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, speciality } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Prevent registering admin accounts through public registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be created through public registration'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'patient',
      phone,
      address,
      speciality
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'User already exists with this email';
    } else if (error.message.includes('MongoServerError') || error.message.includes('MongoNetworkError') || error.message.includes('buffering timed out')) {
      errorMessage = 'Database connection error. Please check if MongoDB is running and the connection string is correct.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Additional security for admin login
    if (role === 'admin') {
      // Reject old "admin" username format - must use proper email
      if (email === 'admin' || !email.includes('@')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, password, or role'
        });
      }

      // Check password strength for admin (minimum 8 characters)
      if (!password || password.length < 8) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email, password, or role'
        });
      }
    }

    // Find user by email and role
    const user = await User.findOne({ email: email.toLowerCase(), role });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or role'
      });
    }

    // Check if user account is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is disabled. Please contact administrator'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or role'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        speciality: user.speciality,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

