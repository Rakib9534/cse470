import { useState, useEffect } from 'react';
import { doctorSlotsAPI } from '../services/api.js';

function Doctors({ doctors }) {
  const [doctorSlots, setDoctorSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Fetch slots for all doctors for the selected date
    const fetchAllSlots = async () => {
      const slotsData = {};
      const loadingData = {};
      
      for (const doctor of doctors) {
        const doctorId = doctor.id || doctor._id;
        if (doctorId) {
          loadingData[doctorId] = true;
          try {
            const result = await doctorSlotsAPI.getSlots(doctorId, selectedDate);
            if (result.success && result.data) {
              slotsData[doctorId] = result.data.availableSlots || [];
            } else {
              slotsData[doctorId] = [];
            }
          } catch (error) {
            console.error(`Error fetching slots for doctor ${doctorId}:`, error);
            slotsData[doctorId] = [];
          } finally {
            loadingData[doctorId] = false;
          }
        }
      }
      
      setDoctorSlots(slotsData);
      setLoadingSlots(loadingData);
    };

    if (doctors.length > 0) {
      fetchAllSlots();
    }
  }, [doctors, selectedDate]);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Available Doctors &amp; Time Slots</h1>
          <p className="card-subtitle">Browse our medical professionals and their available appointment times</p>
        </div>

        {/* Date Selector */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: 'var(--text-secondary)' 
          }}>
            Select Date to View Available Slots:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          {doctors.map((doc) => {
            const doctorId = doc.id || doc._id;
            const slots = doctorSlots[doctorId] || [];
            const isLoading = loadingSlots[doctorId] === true;

            return (
              <div key={doctorId} className="doctor-card">
                <div className="doctor-name">{doc.name}</div>
                <div className="doctor-speciality">{doc.speciality}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Available Time Slots for {new Date(selectedDate).toLocaleDateString()}:
                  </strong>
                  <div className="slots-container" style={{ marginTop: '0.5rem' }}>
                    {isLoading ? (
                      <span className="slot-badge" style={{ color: 'var(--text-tertiary)' }}>
                        Loading slots...
                      </span>
                    ) : slots.length > 0 ? (
                      slots.map((slot) => (
                        <span key={slot} className="slot-badge">
                          {slot}
                        </span>
                      ))
                    ) : (
                      <span className="slot-badge" style={{ color: 'var(--text-light)' }}>
                        No slots available for this date
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Doctors;