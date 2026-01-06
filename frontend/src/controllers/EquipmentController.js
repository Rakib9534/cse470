/**
 * Equipment Controller
 * Handles equipment business logic and coordinates between models and views
 */
import EquipmentModel from '../models/EquipmentModel.js';
import { equipmentAPI } from '../services/api.js';

class EquipmentController {
  constructor() {
    this.equipment = [];
  }

  /**
   * Get all equipment
   * @returns {Promise<{success: boolean, equipment: EquipmentModel[], error: string|null}>}
   */
  async getAllEquipment() {
    try {
      const response = await equipmentAPI.getAll();
      
      if (response.success) {
        this.equipment = response.data.map(data => new EquipmentModel(data));
        return {
          success: true,
          equipment: this.equipment,
          error: null
        };
      } else {
        return {
          success: false,
          equipment: [],
          error: response.error || 'Failed to fetch equipment'
        };
      }
    } catch (error) {
      return {
        success: false,
        equipment: [],
        error: error.message || 'Failed to fetch equipment'
      };
    }
  }

  /**
   * Create new equipment
   * @param {Object} equipmentData - Equipment data
   * @returns {Promise<{success: boolean, equipment: EquipmentModel|null, error: string|null}>}
   */
  async createEquipment(equipmentData) {
    try {
      const equipment = new EquipmentModel(equipmentData);
      const validationErrors = equipment.validate();
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          equipment: null,
          error: validationErrors.join(', ')
        };
      }

      const response = await equipmentAPI.create(equipment.toJSON());
      
      if (response.success) {
        const newEquipment = new EquipmentModel(response.data);
        this.equipment.push(newEquipment);
        return {
          success: true,
          equipment: newEquipment,
          error: null
        };
      } else {
        return {
          success: false,
          equipment: null,
          error: response.error || 'Failed to create equipment'
        };
      }
    } catch (error) {
      return {
        success: false,
        equipment: null,
        error: error.message || 'Failed to create equipment'
      };
    }
  }

  /**
   * Filter equipment by status
   * @param {string} status - Equipment status
   * @returns {EquipmentModel[]}
   */
  filterByStatus(status) {
    if (!status) return this.equipment;
    return this.equipment.filter(eq => eq.status === status);
  }

  /**
   * Get available equipment
   * @returns {EquipmentModel[]}
   */
  getAvailableEquipment() {
    return this.equipment.filter(eq => eq.isAvailable());
  }

  /**
   * Get equipment requiring maintenance
   * @returns {EquipmentModel[]}
   */
  getMaintenanceDue() {
    return this.equipment.filter(eq => eq.isMaintenanceDue());
  }
}

export default EquipmentController;

