import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDoctors
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/doctors')
  .get(protect, getDoctors);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router;

