/**
 * Appointment Controller
 * Handles appointment business logic and coordinates between models and views
 */
import AppointmentModel from '../models/AppointmentModel.js';
import { appointmentAPI } from '../services/api.js';

class AppointmentController {
  constructor() {
    this.appointments = [];
  }

  /**
   * Get all appointments with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, appointments: AppointmentModel[], error: string|null}>}
   */
  async getAllAppointments(filters = {}) {
    try {
      const response = await appointmentAPI.getAll(filters);
      
      if (response.success) {
        this.appointments = response.data.map(data => new AppointmentModel(data));
        return {
          success: true,
          appointments: this.appointments,
          error: null
        };
      } else {
        return {
          success: false,
          appointments: [],
          error: response.error || 'Failed to fetch appointments'
        };
      }
    } catch (error) {
      return {
        success: false,
        appointments: [],
        error: error.message || 'Failed to fetch appointments'
      };
    }
  }

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<{success: boolean, appointment: AppointmentModel|null, error: string|null}>}
   */
  async createAppointment(appointmentData) {
    try {
      const appointment = new AppointmentModel(appointmentData);
      const validationErrors = appointment.validate();
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          appointment: null,
          error: validationErrors.join(', ')
        };
      }

      const response = await appointmentAPI.create(appointment.toJSON());
      
      if (response.success) {
        const newAppointment = new AppointmentModel(response.data);
        this.appointments.push(newAppointment);
        return {
          success: true,
          appointment: newAppointment,
          error: null
        };
      } else {
        return {
          success: false,
          appointment: null,
          error: response.error || 'Failed to create appointment'
        };
      }
    } catch (error) {
      return {
        success: false,
        appointment: null,
        error: error.message || 'Failed to create appointment'
      };
    }
  }

  /**
   * Update an appointment
   * @param {string} id - Appointment ID
   * @param {Object} updates - Update data
   * @returns {Promise<{success: boolean, appointment: AppointmentModel|null, error: string|null}>}
   */
  async updateAppointment(id, updates) {
    try {
      const response = await appointmentAPI.update(id, updates);
      
      if (response.success) {
        const updatedAppointment = new AppointmentModel(response.data);
        const index = this.appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
          this.appointments[index] = updatedAppointment;
        }
        return {
          success: true,
          appointment: updatedAppointment,
          error: null
        };
      } else {
        return {
          success: false,
          appointment: null,
          error: response.error || 'Failed to update appointment'
        };
      }
    } catch (error) {
      return {
        success: false,
        appointment: null,
        error: error.message || 'Failed to update appointment'
      };
    }
  }

  /**
   * Delete an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async deleteAppointment(id) {
    try {
      const response = await appointmentAPI.delete(id);
      
      if (response.success) {
        this.appointments = this.appointments.filter(apt => apt.id !== id);
        return {
          success: true,
          error: null
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete appointment'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete appointment'
      };
    }
  }

  /**
   * Filter appointments by email
   * @param {string} email - Patient email
   * @returns {AppointmentModel[]}
   */
  filterByEmail(email) {
    if (!email) return this.appointments;
    return this.appointments.filter(apt => apt.patientEmail === email);
  }

  /**
   * Get appointments by status
   * @param {string} status - Appointment status
   * @returns {AppointmentModel[]}
   */
  getByStatus(status) {
    return this.appointments.filter(apt => apt.status === status);
  }
}

export default AppointmentController;

