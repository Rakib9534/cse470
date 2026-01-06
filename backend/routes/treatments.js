import express from 'express';
import {
  getTreatments,
  getTreatment,
  createTreatment,
  updateTreatment,
  deleteTreatment
} from '../controllers/treatmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTreatments)
  .post(protect, authorize('doctor'), createTreatment);

router.route('/:id')
  .get(protect, getTreatment)
  .put(protect, authorize('doctor'), updateTreatment)
  .delete(protect, authorize('doctor', 'admin'), deleteTreatment);

export default router;

