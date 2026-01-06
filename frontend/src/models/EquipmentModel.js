/**
 * Equipment Model
 * Represents equipment data structure and business logic
 */
class EquipmentModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.name = data.name || '';
    this.type = data.type || '';
    this.status = data.status || 'available';
    this.location = data.location || '';
    this.serialNumber = data.serialNumber || '';
    this.purchaseDate = data.purchaseDate || '';
    this.lastMaintenance = data.lastMaintenance || null;
    this.nextMaintenance = data.nextMaintenance || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate equipment data
  validate() {
    const errors = [];
    if (!this.name) errors.push('Equipment name is required');
    if (!this.type) errors.push('Equipment type is required');
    return errors;
  }

  // Check if equipment is available
  isAvailable() {
    return this.status === 'available';
  }

  // Check if maintenance is due
  isMaintenanceDue() {
    if (!this.nextMaintenance) return false;
    const nextMaintenanceDate = new Date(this.nextMaintenance);
    const today = new Date();
    return nextMaintenanceDate <= today;
  }

  // Get status badge color
  getStatusColor() {
    const statusColors = {
      available: 'success',
      inUse: 'warning',
      maintenance: 'danger',
      unavailable: 'secondary'
    };
    return statusColors[this.status] || 'secondary';
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      location: this.location,
      serialNumber: this.serialNumber,
      purchaseDate: this.purchaseDate,
      lastMaintenance: this.lastMaintenance,
      nextMaintenance: this.nextMaintenance,
      notes: this.notes
    };
  }
}

export default EquipmentModel;

