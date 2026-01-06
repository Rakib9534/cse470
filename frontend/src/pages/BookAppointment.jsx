import { useState, useEffect } from 'react';
import { useControllers } from '../controllers/ControllerProvider.jsx';

function BookAppointment({ doctors, onCreateAppointment, defaultEmail = '', defaultName = '' }) {
  const { appointment: appointmentController, doctorSlot: doctorSlotController } = useControllers();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patientName, setPatientName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (doctorId && date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, date]);

  const fetchAvailableSlots = async () => {
    try {
      const result = await doctorSlotController.getSlots(doctorId, date);
      if (result.success && result.availableSlots.length > 0) {
        setAvailableSlots(result.availableSlots);
      } else {
        // Fallback to default slots if API fails
        setAvailableSlots(selectedDoctor.slots || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Fallback to default slots
      setAvailableSlots(selectedDoctor.slots || []);
    }
  };

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (message && message.includes('successfully')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!doctorId || !date || !time || !patientName || !email) {
      setMessage('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const appointmentData = {
        doctorId,
        doctorName: selectedDoctor.name,
        speciality: selectedDoctor.speciality,
        date,
        time,
        patientName,
        email,
        phone: phone || '',
      };

      // Create appointment using controller
      const result = await appointmentController.createAppointment(appointmentData);

      if (result.success) {
        // Update local state if callback provided
        if (onCreateAppointment) {
          onCreateAppointment(result.appointment.toJSON());
        }

        // Notification is automatically created by the backend
        setMessage('✅ Appointment booked successfully!');
        
        // Refresh available slots
        await fetchAvailableSlots();
        
        // Reset form fields (except doctor selection)
        setDate('');
        setTime('');
        setPatientName('');
        setEmail('');
        setPhone('');
      } else {
        setMessage(`❌ ${result.error || 'Failed to book appointment. Please try again.'}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setMessage(`❌ ${error.message || 'Failed to book appointment. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Book an Appointment</h1>
          <p className="card-subtitle">Fill in your details to schedule your visit</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">
              Patient Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Doctor <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                setTime('');
              }}
              required
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.speciality}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Appointment Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Preferred Time <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!date || availableSlots.length === 0}
              required
            >
              <option value="">
                {!date ? 'Select date first' : availableSlots.length === 0 ? 'No slots available' : 'Select a time slot'}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {date && availableSlots.length === 0 && (
              <small style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                Loading available slots...
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Booking Appointment...' : 'Confirm Appointment'}
          </button>
        </form>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookAppointment;