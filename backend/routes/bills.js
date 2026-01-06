import express from 'express';
import {
  getBills,
  createBill,
  updateBill
} from '../controllers/billController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getBills)
  .post(protect, authorize('admin'), createBill);

router.route('/:id')
  .put(protect, authorize('admin'), updateBill);

export default router;

