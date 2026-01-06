import express from 'express';
import {
  getSlots,
  updateSlots
} from '../controllers/doctorSlotController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/:doctorId/:date')
  .get(protect, getSlots)
  .put(protect, authorize('doctor', 'admin'), updateSlots);

export default router;

