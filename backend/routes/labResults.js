import express from 'express';
import {
  getLabResults,
  getLabResult,
  createLabResult,
  updateLabResult,
  deleteLabResult
} from '../controllers/labResultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getLabResults)
  .post(protect, authorize('admin', 'technician'), createLabResult);

router.route('/:id')
  .get(protect, getLabResult)
  .put(protect, authorize('admin', 'technician'), updateLabResult)
  .delete(protect, authorize('admin'), deleteLabResult);

export default router;

