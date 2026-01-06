/**
 * Treatment Model
 * Represents treatment data structure and business logic
 */
class TreatmentModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.patientId = data.patientId || '';
    this.patientName = data.patientName || '';
    this.patientEmail = data.patientEmail || '';
    this.doctorId = data.doctorId || '';
    this.doctorName = data.doctorName || '';
    this.treatmentType = data.treatmentType || '';
    this.diagnosis = data.diagnosis || '';
    this.prescription = data.prescription || [];
    this.notes = data.notes || '';
    this.date = data.date || new Date().toISOString();
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate treatment data
  // Note: For creation, patientId and doctorId are handled by backend
  // This validation is mainly for client-side checks
  validate(skipIds = false) {
    const errors = [];
    if (!skipIds) {
      if (!this.patientId && !this.patientEmail) errors.push('Patient ID or email is required');
      if (!this.doctorId) errors.push('Doctor ID is required');
    }
    if (!this.diagnosis) errors.push('Diagnosis is required');
    // treatmentType is optional, removed from required fields
    return errors;
  }

  // Check if treatment is active
  isActive() {
    return this.status === 'active';
  }

  // Get status badge color
  getStatusColor() {
    const statusColors = {
      active: 'success',
      completed: 'info',
      cancelled: 'danger'
    };
    return statusColors[this.status] || 'secondary';
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      doctorId: this.doctorId,
      doctorName: this.doctorName,
      treatmentType: this.treatmentType,
      diagnosis: this.diagnosis,
      prescription: this.prescription,
      notes: this.notes,
      date: this.date,
      status: this.status
    };
  }
}

export default TreatmentModel;

