/**
 * Bill Controller
 * Handles bill business logic and coordinates between models and views
 */
import BillModel from '../models/BillModel.js';
import { billAPI } from '../services/api.js';

class BillController {
  constructor() {
    this.bills = [];
  }

  /**
   * Get all bills with optional filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<{success: boolean, bills: BillModel[], error: string|null}>}
   */
  async getAllBills(filters = {}) {
    try {
      const response = await billAPI.getAll(filters);
      
      if (response.success) {
        this.bills = response.data.map(data => new BillModel(data));
        return {
          success: true,
          bills: this.bills,
          error: null
        };
      } else {
        return {
          success: false,
          bills: [],
          error: response.error || 'Failed to fetch bills'
        };
      }
    } catch (error) {
      return {
        success: false,
        bills: [],
        error: error.message || 'Failed to fetch bills'
      };
    }
  }

  /**
   * Create a new bill
   * @param {Object} billData - Bill data
   * @returns {Promise<{success: boolean, bill: BillModel|null, error: string|null}>}
   */
  async createBill(billData) {
    try {
      const bill = new BillModel(billData);
      const validationErrors = bill.validate();
      
      if (validationErrors.length > 0) {
        return {
          success: false,
          bill: null,
          error: validationErrors.join(', ')
        };
      }

      // Calculate total
      bill.calculateTotal();

      const response = await billAPI.create(bill.toJSON());
      
      if (response.success) {
        const newBill = new BillModel(response.data);
        this.bills.push(newBill);
        return {
          success: true,
          bill: newBill,
          error: null
        };
      } else {
        return {
          success: false,
          bill: null,
          error: response.error || 'Failed to create bill'
        };
      }
    } catch (error) {
      return {
        success: false,
        bill: null,
        error: error.message || 'Failed to create bill'
      };
    }
  }

  /**
   * Filter bills by patient email
   * @param {string} email - Patient email
   * @returns {BillModel[]}
   */
  filterByEmail(email) {
    if (!email) return this.bills;
    return this.bills.filter(bill => bill.patientEmail === email);
  }

  /**
   * Get unpaid bills
   * @returns {BillModel[]}
   */
  getUnpaidBills() {
    return this.bills.filter(bill => !bill.isPaid());
  }

  /**
   * Get overdue bills
   * @returns {BillModel[]}
   */
  getOverdueBills() {
    return this.bills.filter(bill => bill.isOverdue());
  }
}

export default BillController;

