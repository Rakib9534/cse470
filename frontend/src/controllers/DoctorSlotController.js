/**
 * Doctor Slot Controller
 * Handles doctor slot business logic and coordinates between models and views
 */
import DoctorSlotModel from '../models/DoctorSlotModel.js';
import { doctorSlotsAPI } from '../services/api.js';

class DoctorSlotController {
  constructor() {
    this.slots = [];
  }

  /**
   * Get available slots for a doctor on a specific date
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<{success: boolean, slots: DoctorSlotModel[], availableSlots: string[], bookedSlots: string[], error: string|null}>}
   */
  async getSlots(doctorId, date) {
    try {
      const response = await doctorSlotsAPI.getSlots(doctorId, date);
      
      if (response.success) {
        const data = response.data;
        this.slots = (data.slots || []).map(slotData => new DoctorSlotModel(slotData));
        
        return {
          success: true,
          slots: this.slots,
          availableSlots: data.availableSlots || [],
          bookedSlots: data.bookedSlots || [],
          error: null
        };
      } else {
        return {
          success: false,
          slots: [],
          availableSlots: data?.availableSlots || [],
          bookedSlots: [],
          error: response.error || 'Failed to fetch slots'
        };
      }
    } catch (error) {
      return {
        success: false,
        slots: [],
        availableSlots: [],
        bookedSlots: [],
        error: error.message || 'Failed to fetch slots'
      };
    }
  }

  /**
   * Check if a slot is available
   * @param {string} time - Time slot (HH:MM)
   * @returns {boolean}
   */
  isSlotAvailable(time) {
    const slot = this.slots.find(s => s.time === time);
    return slot ? slot.canBook() : false;
  }

  /**
   * Get available time slots
   * @returns {string[]}
   */
  getAvailableSlots() {
    return this.slots
      .filter(slot => slot.canBook())
      .map(slot => slot.time)
      .sort();
  }

  /**
   * Get booked time slots
   * @returns {string[]}
   */
  getBookedSlots() {
    return this.slots
      .filter(slot => slot.isBooked)
      .map(slot => slot.time)
      .sort();
  }

  /**
   * Update available slots for a doctor on a specific date
   * @param {string} doctorId - Doctor ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @param {string[]} availableSlots - Array of available time slots
   * @returns {Promise<{success: boolean, data: object|null, error: string|null}>}
   */
  async updateSlots(doctorId, date, availableSlots) {
    try {
      const response = await doctorSlotsAPI.updateSlots(doctorId, date, availableSlots);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          error: null
        };
      } else {
        return {
          success: false,
          data: null,
          error: response.error || 'Failed to update slots'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to update slots'
      };
    }
  }
}

export default DoctorSlotController;

