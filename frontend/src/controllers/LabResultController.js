/**
 * Lab Result Controller
 * Handles lab result business logic and coordinates between models and views
 */
import LabResultModel from '../models/LabResultModel.js';
import { labResultAPI } from '../services/api.js';

class LabResultController {
  constructor() {
    this.labResults = [];
  }

  /**
   * Get all lab results with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, labResults: LabResultModel[], error: string|null}>}
   */
  async getAllLabResults(filters = {}) {
    try {
      const response = await labResultAPI.getAll(filters);
      
      if (response.success) {
        this.labResults = response.data.map(data => new LabResultModel(data));
        return {
          success: true,
          labResults: this.labResults,
          error: null
        };
      } else {
        return {
          success: false,
          labResults: [],
          error: response.error || 'Failed to fetch lab results'
        };
      }
    } catch (error) {
      return {
        success: false,
        labResults: [],
        error: error.message || 'Failed to fetch lab results'
      };
    }
  }

  /**
   * Create a new lab result
   * @param {Object} labResultData - Lab result data
   * @returns {Promise<{success: boolean, labResult: LabResultModel|null, error: string|null}>}
   */
  async createLabResult(labResultData) {
    try {
      const labResult = new LabResultModel(labResultData);
      const validationErrors = labResult.validate();
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          labResult: null,
          error: validationErrors.join(', ')
        };
      }

      const response = await labResultAPI.create(labResult.toJSON());
      
      if (response.success) {
        const newLabResult = new LabResultModel(response.data);
        this.labResults.push(newLabResult);
        return {
          success: true,
          labResult: newLabResult,
          error: null
        };
      } else {
        return {
          success: false,
          labResult: null,
          error: response.error || 'Failed to create lab result'
        };
      }
    } catch (error) {
      return {
        success: false,
        labResult: null,
        error: error.message || 'Failed to create lab result'
      };
    }
  }

  /**
   * Filter lab results by email
   * @param {string} email - Patient email
   * @returns {LabResultModel[]}
   */
  filterByEmail(email) {
    if (!email) return this.labResults;
    return this.labResults.filter(result => 
      result.patientEmail?.toLowerCase().includes(email.toLowerCase()) ||
      result.patientId?.toLowerCase().includes(email.toLowerCase())
    );
  }

  /**
   * Filter lab results by patient name
   * @param {string} name - Patient name
   * @returns {LabResultModel[]}
   */
  filterByName(name) {
    if (!name) return this.labResults;
    return this.labResults.filter(result => 
      result.patientName?.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Filter lab results by email and name
   * @param {string} email - Patient email or ID
   * @param {string} name - Patient name
   * @returns {LabResultModel[]}
   */
  filterByEmailAndName(email, name) {
    let filtered = this.labResults;
    
    if (email) {
      filtered = filtered.filter(result => 
        result.patientEmail?.toLowerCase().includes(email.toLowerCase()) ||
        result.patientId?.toLowerCase().includes(email.toLowerCase())
      );
    }
    
    if (name) {
      filtered = filtered.filter(result => 
        result.patientName?.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    return filtered;
  }
}

export default LabResultController;

