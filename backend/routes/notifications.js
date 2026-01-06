import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

export default router;
