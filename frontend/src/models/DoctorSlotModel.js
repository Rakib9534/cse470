/**
 * Doctor Slot Model
 * Represents doctor time slot data structure and business logic
 */
class DoctorSlotModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.doctorId = data.doctorId || '';
    this.doctorName = data.doctorName || '';
    this.date = data.date || '';
    this.time = data.time || '';
    this.isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
    this.isBooked = data.isBooked || false;
    this.appointmentId = data.appointmentId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Validate slot data
  validate() {
    const errors = [];
    if (!this.doctorId) errors.push('Doctor ID is required');
    if (!this.date) errors.push('Date is required');
    if (!this.time) errors.push('Time is required');
    return errors;
  }

  // Check if slot is available
  canBook() {
    return this.isAvailable && !this.isBooked;
  }

  // Check if slot is in the past
  isPast() {
    const slotDateTime = new Date(`${this.date}T${this.time}`);
    return slotDateTime < new Date();
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      doctorId: this.doctorId,
      doctorName: this.doctorName,
      date: this.date,
      time: this.time,
      isAvailable: this.isAvailable,
      isBooked: this.isBooked,
      appointmentId: this.appointmentId
    };
  }
}

export default DoctorSlotModel;

