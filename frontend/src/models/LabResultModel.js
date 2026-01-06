/**
 * Lab Result Model
 * Represents lab result data structure and business logic
 */
class LabResultModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.patientId = data.patientId || '';
    this.patientName = data.patientName || '';
    this.patientEmail = data.patientEmail || '';
    this.testType = data.testType || '';
    this.testDate = data.testDate || '';
    this.uploadDate = data.uploadDate || new Date().toISOString();
    this.fileName = data.fileName || '';
    this.fileUrl = data.fileUrl || '';
    this.technicianName = data.technicianName || '';
    this.notes = data.notes || '';
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Validate lab result data
  validate() {
    const errors = [];
    if (!this.patientId) errors.push('Patient ID is required');
    if (!this.testType) errors.push('Test type is required');
    if (!this.testDate) errors.push('Test date is required');
    if (!this.fileName) errors.push('File name is required');
    return errors;
  }

  // Check if result is recent (within last 30 days)
  isRecent() {
    const testDate = new Date(this.testDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return testDate > thirtyDaysAgo;
  }

  // Get status badge color
  getStatusColor() {
    const statusColors = {
      pending: 'warning',
      completed: 'success',
      reviewed: 'info'
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
      testType: this.testType,
      testDate: this.testDate,
      uploadDate: this.uploadDate,
      fileName: this.fileName,
      fileUrl: this.fileUrl,
      technicianName: this.technicianName,
      notes: this.notes,
      status: this.status
    };
  }
}

export default LabResultModel;

