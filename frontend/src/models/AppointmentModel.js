/**
 * Appointment Model
 * Represents appointment data structure and business logic
 */
class AppointmentModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.patientName = data.patientName || '';
    this.patientEmail = data.patientEmail || data.email || '';
    this.doctorId = data.doctorId || '';
    this.doctorName = data.doctorName || '';
    this.speciality = data.speciality || '';
    this.date = data.date || '';
    this.time = data.time || '';
    this.status = data.status || 'pending';
    this.phone = data.phone || '';
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate appointment data
  validate() {
    const errors = [];
    if (!this.patientName) errors.push('Patient name is required');
    if (!this.patientEmail) errors.push('Patient email is required');
    if (!this.doctorId) errors.push('Doctor is required');
    if (!this.date) errors.push('Date is required');
    if (!this.time) errors.push('Time is required');
    return errors;
  }

  // Check if appointment is upcoming
  isUpcoming() {
    const appointmentDate = new Date(`${this.date}T${this.time}`);
    return appointmentDate > new Date();
  }

  // Check if appointment is past
  isPast() {
    const appointmentDate = new Date(`${this.date}T${this.time}`);
    return appointmentDate < new Date();
  }

  // Get status badge color
  getStatusColor() {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };
    return statusColors[this.status] || 'secondary';
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      patientName: this.patientName,
      patientEmail: this.patientEmail,
      email: this.patientEmail,
      doctorId: this.doctorId,
      doctorName: this.doctorName,
      speciality: this.speciality,
      date: this.date,
      time: this.time,
      status: this.status,
      phone: this.phone,
      notes: this.notes
    };
  }
}

export default AppointmentModel;

