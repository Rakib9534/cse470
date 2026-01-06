import { useState, useEffect } from 'react';
import { equipmentAPI } from '../services/api.js';

function EquipmentAvailability() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const result = await equipmentAPI.getAll();
      if (result.success && result.data) {
        // Handle both array and object with data property
        const equipmentList = Array.isArray(result.data) ? result.data : (result.data.data || []);
        setEquipment(equipmentList);
      } else {
        setEquipment([]);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (equipmentId, date) => {
    const eq = equipment.find(e => (e._id || e.id) === equipmentId);
    if (!eq || !eq.bookings) return [];
    return eq.bookings.filter(
      (b) => b.date === date && (b.status === 'booked' || b.status === 'confirmed')
    );
  };

  // Default time slots for equipment booking
  const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getAvailableSlots = (eq) => {
    // Use availableSlots from equipment if provided, otherwise use default slots
    const allSlots = eq.availableSlots && eq.availableSlots.length > 0 
      ? eq.availableSlots 
      : DEFAULT_TIME_SLOTS;
    
    const bookedSlots = getBookingsForDate(eq._id || eq.id, selectedDate).map((b) => b.time);
    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  };

  const getAvailabilityPercentage = (eq) => {
    if (eq.status === 'maintenance' || eq.status === 'in-use' || eq.status === 'unavailable') return 0;
    const allSlots = eq.availableSlots && eq.availableSlots.length > 0 
      ? eq.availableSlots 
      : DEFAULT_TIME_SLOTS;
    const bookedSlots = getBookingsForDate(eq._id || eq.id, selectedDate).length;
    if (allSlots.length === 0) return 100;
    return Math.round(((allSlots.length - bookedSlots) / allSlots.length) * 100);
  };

  const handleSlotBooking = async (equipmentId, slot) => {
    try {
      setBooking(true);
      setMessage('');
      
      const result = await equipmentAPI.book(equipmentId, {
        date: selectedDate,
        time: slot,
        purpose: 'Medical procedure'
      });

      if (result.success) {
        setMessage('Equipment booked successfully!');
        setSelectedEquipment(null);
        // Refresh equipment list to show updated bookings
        await fetchEquipment();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to book equipment');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error booking equipment:', error);
      setMessage('Error booking equipment: ' + (error.message || 'Unknown error'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setBooking(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'var(--success-color)';
      case 'in-use':
        return 'var(--warning-color)';
      case 'maintenance':
        return 'var(--accent-color)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Equipment Availability</h1>
          <p className="card-subtitle">View and book medical equipment slots</p>
        </div>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}

        <div className="filter-container">
          <label className="form-label">Select Date</label>
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {loading ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">Loading equipment...</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">
              No equipment found. Please ask an admin to add equipment in the system.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            {equipment.map((eq) => {
              const equipmentId = eq._id || eq.id;
              const availableSlots = getAvailableSlots(eq);
              const availability = getAvailabilityPercentage(eq);
              const allSlots = eq.availableSlots && eq.availableSlots.length > 0 
                ? eq.availableSlots 
                : DEFAULT_TIME_SLOTS;
              const totalSlots = allSlots.length;

              return (
                <div
                  key={equipmentId}
                  className="card"
                  style={{
                    borderLeft: `3px solid ${getStatusColor(eq.status)}`,
                    cursor: eq.status === 'available' ? 'pointer' : 'default',
                  }}
                  onClick={() =>
                    eq.status === 'available' ? setSelectedEquipment(eq) : null
                  }
                >
                  <h3 className="card-title">{eq.name}</h3>
                  <p className="card-subtitle">
                    {eq.equipmentType || eq.type || 'Medical Equipment'} • {eq.location || 'Hospital'}
                  </p>
                  {eq.description && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {eq.description}
                    </p>
                  )}
                  <p style={{ marginTop: '0.5rem' }}>
                    <strong>Availability:</strong> {availability}% (
                    {availableSlots.length}/{totalSlots} slots available)
                  </p>
                  {eq.bookings && eq.bookings.length > 0 && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {eq.bookings.filter(b => b.status === 'booked' || b.status === 'confirmed').length} active booking{eq.bookings.filter(b => b.status === 'booked' || b.status === 'confirmed').length !== 1 ? 's' : ''}
                    </p>
                  )}
                  {eq.status === 'maintenance' && (
                    <p style={{ color: 'var(--accent-color)', marginTop: '0.5rem' }}>
                      Under maintenance
                    </p>
                  )}
                  {eq.status === 'in-use' && (
                    <p style={{ color: 'var(--warning-color)', marginTop: '0.5rem' }}>
                      Currently in use
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedEquipment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className="card"
            style={{ maxWidth: '600px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <h2 className="card-title">
                {selectedEquipment.name}
              </h2>
              <p className="card-subtitle">
                {selectedEquipment.location || 'Hospital'} • {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Available Time Slots</h3>
              {getAvailableSlots(selectedEquipment).length === 0 ? (
                <p>No available slots for this date. Please try another date.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {getAvailableSlots(selectedEquipment).map((slot) => (
                    <button
                      key={slot}
                      className="btn btn-primary"
                      onClick={() =>
                        handleSlotBooking(selectedEquipment._id || selectedEquipment.id, slot)
                      }
                      disabled={booking}
                      style={{
                        opacity: booking ? 0.6 : 1,
                        cursor: booking ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
              {booking && (
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Booking equipment...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentAvailability;