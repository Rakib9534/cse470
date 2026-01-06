import express from 'express';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

export default router;

