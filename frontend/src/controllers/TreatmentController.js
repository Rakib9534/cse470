/**
 * Treatment Controller
 * Handles treatment business logic and coordinates between models and views
 */
import TreatmentModel from '../models/TreatmentModel.js';
import { treatmentAPI } from '../services/api.js';

class TreatmentController {
  constructor() {
    this.treatments = [];
  }

  /**
   * Get all treatments with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, treatments: TreatmentModel[], error: string|null}>}
   */
  async getAllTreatments(filters = {}) {
    try {
      const response = await treatmentAPI.getAll(filters);
      
      if (response.success) {
        this.treatments = response.data.map(data => new TreatmentModel(data));
        return {
          success: true,
          treatments: this.treatments,
          error: null
        };
      } else {
        return {
          success: false,
          treatments: [],
          error: response.error || 'Failed to fetch treatments'
        };
      }
    } catch (error) {
      return {
        success: false,
        treatments: [],
        error: error.message || 'Failed to fetch treatments'
      };
    }
  }

  /**
   * Create a new treatment
   * @param {Object} treatmentData - Treatment data
   * @returns {Promise<{success: boolean, treatment: TreatmentModel|null, error: string|null}>}
   */
  async createTreatment(treatmentData) {
    try {
      // Map prescription format from form to backend format
      const mappedData = {
        ...treatmentData,
        prescription: (treatmentData.prescriptions || []).map(p => ({
          medicineName: p.medicine || '',
          dosage: p.dosage || '',
          frequency: p.frequency || '',
          duration: p.duration || '',
          instructions: p.instructions || ''
        }))
      };

      // Validate only essential fields (skip IDs since backend handles them)
      const treatment = new TreatmentModel(mappedData);
      const validationErrors = treatment.validate(true); // Skip ID validation
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          treatment: null,
          error: validationErrors.join(', ')
        };
      }

      // Send data in format backend expects (with patientEmail, not patientId)
      const requestData = {
        patientEmail: treatmentData.patientEmail,
        treatmentDate: treatmentData.treatmentDate,
        diagnosis: treatmentData.diagnosis,
        notes: treatmentData.notes || '',
        prescription: mappedData.prescription
      };

      const response = await treatmentAPI.create(requestData);
      
      if (response.success) {
        const newTreatment = new TreatmentModel(response.data);
        this.treatments.push(newTreatment);
        return {
          success: true,
          treatment: newTreatment,
          error: null
        };
      } else {
        return {
          success: false,
          treatment: null,
          error: response.error || 'Failed to create treatment'
        };
      }
    } catch (error) {
      return {
        success: false,
        treatment: null,
        error: error.message || 'Failed to create treatment'
      };
    }
  }

  /**
   * Filter treatments by email
   * @param {string} email - Patient email
   * @returns {TreatmentModel[]}
   */
  filterByEmail(email) {
    if (!email) return this.treatments;
    return this.treatments.filter(treatment => treatment.patientEmail === email);
  }

  /**
   * Filter treatments by doctor ID
   * @param {string} doctorId - Doctor ID
   * @returns {TreatmentModel[]}
   */
  filterByDoctor(doctorId) {
    if (!doctorId) return this.treatments;
    return this.treatments.filter(treatment => treatment.doctorId === doctorId);
  }

  /**
   * Get active treatments
   * @returns {TreatmentModel[]}
   */
  getActiveTreatments() {
    return this.treatments.filter(treatment => treatment.isActive());
  }
}

export default TreatmentController;

