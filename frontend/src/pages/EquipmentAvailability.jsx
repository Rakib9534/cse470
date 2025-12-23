import { useState, useEffect } from 'react';

function EquipmentAvailability() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('equipmentBookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Sample equipment data with availability
  const [equipment] = useState([
    {
      id: 'eq1',
      name: 'MRI Scanner',
      type: 'Imaging',
      status: 'available',
      location: 'Radiology Wing - Room 101',
      maintenanceDue: '2024-12-15',
      slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      capacity: 6,
      description: 'High-resolution MRI scanner for detailed imaging',
      icon: '🧲'
    },
    {
      id: 'eq2',
      name: 'CT Scanner',
      type: 'Imaging',
      status: 'available',
      location: 'Radiology Wing - Room 102',
      maintenanceDue: '2024-12-20',
      slots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
      capacity: 8,
      description: 'Advanced CT scanner for rapid diagnostic imaging',
      icon: '📷'
    },
    {
      id: 'eq3',
      name: 'Ultrasound Machine',
      type: 'Imaging',
      status: 'in-use',
      location: 'Diagnostic Center - Room 203',
      maintenanceDue: '2024-12-10',
      slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      capacity: 5,
      description: 'Portable ultrasound system for real-time imaging',
      icon: '📡'
    },
    {
      id: 'eq4',
      name: 'X-Ray Machine',
      type: 'Imaging',
      status: 'available',
      location: 'Radiology Wing - Room 103',
      maintenanceDue: '2024-12-25',
      slots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      capacity: 9,
      description: 'Digital X-ray system with high image quality',
      icon: '📸'
    },
    {
      id: 'eq5',
      name: 'ECG Machine',
      type: 'Cardiac',
      status: 'available',
      location: 'Cardiology Department - Room 301',
      maintenanceDue: '2024-12-18',
      slots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      capacity: 8,
      description: '12-lead ECG machine for cardiac monitoring',
      icon: '📊'
    },
    {
      id: 'eq6',
      name: 'Ventilator',
      type: 'Life Support',
      status: 'maintenance',
      location: 'ICU - Room 401',
      maintenanceDue: '2024-12-05',
      slots: [],
      capacity: 0,
      description: 'Advanced ventilator for critical care patients',
      icon: '💨'
    },
    {
      id: 'eq7',
      name: 'Blood Analyzer',
      type: 'Laboratory',
      status: 'available',
      location: 'Lab - Room 501',
      maintenanceDue: '2024-12-22',
      slots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      capacity: 9,
      description: 'Automated blood analysis system',
      icon: '🧪'
    },
    {
      id: 'eq8',
      name: 'Dialysis Machine',
      type: 'Life Support',
      status: 'available',
      location: 'Nephrology - Room 302',
      maintenanceDue: '2024-12-12',
      slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      capacity: 6,
      description: 'Hemodialysis machine for kidney treatment',
      icon: '🩸'
    }
  ]);

  // Get bookings for selected date
  const getBookingsForDate = (equipmentId, date) => {
    return bookings.filter(
      b => b.equipmentId === equipmentId && b.date === date
    );
  };

  // Get available slots for equipment
  const getAvailableSlots = (eq) => {
    const bookedSlots = getBookingsForDate(eq.id, selectedDate).map(b => b.time);
    return eq.slots.filter(slot => !bookedSlots.includes(slot));
  };

  // Calculate availability percentage
  const getAvailabilityPercentage = (eq) => {
    if (eq.status === 'maintenance' || eq.status === 'in-use') return 0;
    const bookedSlots = getBookingsForDate(eq.id, selectedDate).length;
    return Math.round(((eq.capacity - bookedSlots) / eq.capacity) * 100);
  };

  const handleSlotBooking = (equipmentId, slot) => {
    const newBooking = {
      id: Date.now().toString(),
      equipmentId,
      equipmentName: equipment.find(e => e.id === equipmentId)?.name,
      date: selectedDate,
      time: slot,
      bookedAt: new Date().toISOString()
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('equipmentBookings', JSON.stringify(updatedBookings));
    
    // Close modal
    setSelectedEquipment(null);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return { text: 'Available', color: 'var(--success-color)', bg: 'var(--secondary-light)' };
      case 'in-use':
        return { text: 'In Use', color: 'var(--warning-color)', bg: 'rgba(243, 156, 18, 0.1)' };
      case 'maintenance':
        return { text: 'Maintenance', color: 'var(--accent-color)', bg: 'var(--accent-light)' };
      default:
        return { text: 'Unknown', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' };
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Equipment Availability</h1>
          <p className="card-subtitle">View and book medical equipment slots</p>
        </div>

        {/* Date Selector */}
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

        {/* Equipment Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          {equipment.map((eq) => {
            const availableSlots = getAvailableSlots(eq);
            const availability = getAvailabilityPercentage(eq);
            const statusBadge = getStatusBadge(eq.status);
            const bookedCount = getBookingsForDate(eq.id, selectedDate).length;

            return (
              <div
                key={eq.id}
                className="card"
                style={{
                  borderLeft: `3px solid ${getStatusColor(eq.status)}`,
                  background: `linear-gradient(to right, ${getStatusColor(eq.status)}08 0%, var(--bg-primary) 5%)`,
                  cursor: eq.status === 'available' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => eq.status === 'available' && setSelectedEquipment(eq)}
                onMouseEnter={(e) => {
                  if (eq.status === 'available') {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${getStatusColor(eq.status)}15`,
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      {eq.icon}
                    </div>
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        {eq.name}
                      </h3>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-tertiary)',
                        fontWeight: '500'
                      }}>
                        {eq.type}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {statusBadge.text}
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      Availability
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: availability > 50 ? 'var(--success-color)' : availability > 25 ? 'var(--warning-color)' : 'var(--accent-color)'
                    }}>
                      {availability}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${availability}%`,
                      height: '100%',
                      background: availability > 50 ? 'var(--success-color)' : availability > 25 ? 'var(--warning-color)' : 'var(--accent-color)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      Location
                    </div>
                    <div>{eq.location}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                      Slots Available
                    </div>
                    <div>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>
                        {availableSlots.length}
                      </strong> / {eq.capacity}
                    </div>
                  </div>
                </div>

                {eq.status === 'available' && (
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      fontSize: '0.875rem',
                      padding: '0.625rem 1rem'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEquipment(eq);
                    }}
                  >
                    View Available Slots
                  </button>
                )}

                {eq.status === 'maintenance' && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--accent-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--accent-color)',
                    textAlign: 'center'
                  }}>
                    Maintenance due: {new Date(eq.maintenanceDue).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEquipment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {selectedEquipment.icon} {selectedEquipment.name}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--text-tertiary)'
                }}>
                  {selectedEquipment.location} • {selectedDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-secondary)';
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-tertiary)';
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                {selectedEquipment.description}
              </p>
            </div>

            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Available Time Slots
              </h3>
              
              {getAvailableSlots(selectedEquipment).length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: 'var(--text-tertiary)'
                }}>
                  <p style={{ margin: 0 }}>No available slots for this date. Please try another date.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {getAvailableSlots(selectedEquipment).map((slot) => (
                    <button
                      key={slot}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                      onClick={() => handleSlotBooking(selectedEquipment.id, slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {getBookingsForDate(selectedEquipment.id, selectedDate).length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  Booked Slots
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {getBookingsForDate(selectedEquipment.id, selectedDate).map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {booking.time}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default EquipmentAvailability;

