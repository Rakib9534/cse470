import { useState, useEffect } from 'react';
import { addNotification } from '../services/notificationService';

function BookAppointment({ doctors, onCreateAppointment }) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const selectedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (message && message.includes('successfully')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!doctorId || !date || !time || !patientName || !email) {
      setMessage('Please fill all required fields.');
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      doctorId,
      doctorName: selectedDoctor.name,
      speciality: selectedDoctor.speciality,
      date,
      time,
      patientName,
      email,
      phone,
    };

    onCreateAppointment(newAppointment);
    
    // Add notification for appointment booking
    addNotification({
      id: Date.now().toString(),
      title: 'Appointment Booked',
      message: `Appointment confirmed with ${selectedDoctor.name} (${selectedDoctor.speciality}) on ${date} at ${time}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'appointment'
    });
    
    setMessage('Appointment booked successfully and added to your dashboard.');
    
    // Reset form fields (except doctor selection)
    setDate('');
    setTime('');
    setPatientName('');
    setEmail('');
    setPhone('');
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
            >
              <option value="">Select a time slot</option>
              {selectedDoctor.slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Confirm Appointment
          </button>
        </form>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookAppointment;