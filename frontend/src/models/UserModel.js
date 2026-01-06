/**
 * User Model
 * Represents user data structure and business logic
 */
class UserModel {
  constructor(data = {}) {
    this.id = data._id || data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'patient';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.speciality = data.speciality || '';
    this.token = data.token || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Validate user data
  validate() {
    const errors = [];
    if (!this.email) errors.push('Email is required');
    if (!this.name) errors.push('Name is required');
    if (!this.role) errors.push('Role is required');
    return errors;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      phone: this.phone,
      address: this.address,
      speciality: this.speciality,
      isActive: this.isActive,
      token: this.token // Include token for authentication
    };
  }

  // Check if user is admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Check if user is doctor
  isDoctor() {
    return this.role === 'doctor';
  }

  // Check if user is patient
  isPatient() {
    return this.role === 'patient';
  }
}

export default UserModel;

