import express from 'express';
import {
  getEquipment,
  getEquipmentById,
  bookEquipment,
  createEquipment,
  updateEquipment
} from '../controllers/equipmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getEquipment)
  .post(protect, authorize('admin'), createEquipment);

router.route('/:id')
  .get(protect, getEquipmentById)
  .put(protect, authorize('admin'), updateEquipment);

router.route('/:id/book')
  .post(protect, bookEquipment);

export default router;

