import { useState, useEffect } from 'react';
import { useControllers } from '../../controllers/ControllerProvider.jsx';

function TimeSlotManagement({ doctorId }) {
  const { doctorSlot: doctorSlotController } = useControllers();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load doctor's slots from backend API
  useEffect(() => {
    const loadSlots = async () => {
      if (!doctorId || doctorId === 'doctor-placeholder') {
        setMessage('Please log in to manage your time slots.');
        return;
      }

      try {
        setLoading(true);
        const result = await doctorSlotController.getSlots(doctorId, selectedDate);
        if (result.success) {
          setAvailableSlots(result.availableSlots || []);
        } else {
          // If no slots found, initialize with empty array
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Error loading slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [doctorId, selectedDate, doctorSlotController]);

  const handleAddSlot = async () => {
    if (!newSlot) {
      setMessage('Please enter a time slot.');
      return;
    }

    if (availableSlots.includes(newSlot)) {
      setMessage('This time slot already exists.');
      return;
    }

    if (!doctorId || doctorId === 'doctor-placeholder') {
      setMessage('Please log in to manage your time slots.');
      return;
    }

    const updatedSlots = [...availableSlots, newSlot].sort();
    
    try {
      setLoading(true);
      const result = await doctorSlotController.updateSlots(doctorId, selectedDate, updatedSlots);
      
      if (result.success) {
        setAvailableSlots(updatedSlots);
        setNewSlot('');
        setMessage('Time slot added successfully.');
      } else {
        setMessage(`Error: ${result.error || 'Failed to add time slot.'}`);
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      setMessage(`Error: ${error.message || 'Failed to add time slot.'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveSlot = async (slot) => {
    if (!doctorId || doctorId === 'doctor-placeholder') {
      setMessage('Please log in to manage your time slots.');
      return;
    }

    const updatedSlots = availableSlots.filter(s => s !== slot);
    
    try {
      setLoading(true);
      const result = await doctorSlotController.updateSlots(doctorId, selectedDate, updatedSlots);
      
      if (result.success) {
        setAvailableSlots(updatedSlots);
        setMessage('Time slot removed successfully.');
      } else {
        setMessage(`Error: ${result.error || 'Failed to remove time slot.'}`);
      }
    } catch (error) {
      console.error('Error removing slot:', error);
      setMessage(`Error: ${error.message || 'Failed to remove time slot.'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleBulkAdd = async () => {
    if (!doctorId || doctorId === 'doctor-placeholder') {
      setMessage('Please log in to manage your time slots.');
      return;
    }

    const commonSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const updatedSlots = [...new Set([...availableSlots, ...commonSlots])].sort();
    
    try {
      setLoading(true);
      const result = await doctorSlotController.updateSlots(doctorId, selectedDate, updatedSlots);
      
      if (result.success) {
        setAvailableSlots(updatedSlots);
        setMessage('Common time slots added successfully.');
      } else {
        setMessage(`Error: ${result.error || 'Failed to add common slots.'}`);
      }
    } catch (error) {
      console.error('Error adding bulk slots:', error);
      setMessage(`Error: ${error.message || 'Failed to add common slots.'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Manage Available Time Slots</h2>
          <p className="card-subtitle">Update your availability for patient appointments</p>
        </div>

        <div className="filter-container">
          <label className="form-label">
            Select Date
          </label>
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginTop: '1.5rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Add Time Slot (HH:MM format)
            </label>
            <input
              type="time"
              className="form-input"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="09:00"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddSlot}
            style={{ height: 'fit-content' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Slot'}
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleBulkAdd}
            style={{ fontSize: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Common Slots (8 AM - 5 PM)'}
          </button>
        </div>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Available Slots for {new Date(selectedDate).toLocaleDateString()}
          </h3>

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Loading slots...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No time slots available for this date. Add slots to start accepting appointments.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '0.75rem'
            }}>
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {slot}
                  </span>
                  <button
                    onClick={() => handleRemoveSlot(slot)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-color)',
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--accent-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                    title="Remove slot"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeSlotManagement;

