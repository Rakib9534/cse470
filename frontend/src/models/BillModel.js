/**
 * Bill Model
 * Represents bill data structure and business logic
 */
class BillModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.patientId = data.patientId || '';
    this.patientName = data.patientName || '';
    this.patientEmail = data.patientEmail || '';
    this.appointmentId = data.appointmentId || null;
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.tax = data.tax || 0;
    this.discount = data.discount || 0;
    this.total = data.total || 0;
    this.status = data.status || 'pending';
    this.paymentMethod = data.paymentMethod || '';
    this.paidDate = data.paidDate || null;
    this.dueDate = data.dueDate || null;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate bill data
  validate() {
    const errors = [];
    if (!this.patientId) errors.push('Patient ID is required');
    if (this.items.length === 0) errors.push('Bill must have at least one item');
    if (this.total <= 0) errors.push('Total must be greater than 0');
    return errors;
  }

  // Calculate total from items
  calculateTotal() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.tax - this.discount;
    return this.total;
  }

  // Check if bill is paid
  isPaid() {
    return this.status === 'paid';
  }

  // Check if bill is overdue
  isOverdue() {
    if (!this.dueDate || this.isPaid()) return false;
    const dueDate = new Date(this.dueDate);
    return dueDate < new Date();
  }

  // Get status badge color
  getStatusColor() {
    const statusColors = {
      pending: 'warning',
      paid: 'success',
      overdue: 'danger',
      cancelled: 'secondary'
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
      appointmentId: this.appointmentId,
      items: this.items,
      subtotal: this.subtotal,
      tax: this.tax,
      discount: this.discount,
      total: this.total,
      status: this.status,
      paymentMethod: this.paymentMethod,
      paidDate: this.paidDate,
      dueDate: this.dueDate,
      notes: this.notes
    };
  }
}

export default BillModel;

