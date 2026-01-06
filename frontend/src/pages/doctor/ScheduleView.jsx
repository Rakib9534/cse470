import { useState, useEffect } from 'react';
import { useControllers } from '../../controllers/ControllerProvider.jsx';

function ScheduleView({ doctorId }) {
  const { appointment: appointmentController } = useControllers();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load appointments from backend API
  useEffect(() => {
    const loadAppointments = async () => {
      if (!doctorId || doctorId === 'doctor-placeholder') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await appointmentController.getAllAppointments({ doctorId });
        if (result.success) {
          setAppointments(result.appointments.map(apt => apt.toJSON()));
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [doctorId, appointmentController]);

  // Get appointments for selected date
  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => apt.date === date);
  };

  // Get week dates
  const getWeekDates = () => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      weekDates.push(currentDate.toISOString().split('T')[0]);
    }
    return weekDates;
  };

  // Get time slots for the day
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const getAppointmentForSlot = (date, time) => {
    return appointments.find(apt => apt.date === date && apt.time === time);
  };

  const timeSlots = getTimeSlots();

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title">Appointment Schedule</h2>
            <p className="card-subtitle">View your daily and weekly appointments</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('day')}
              className={viewMode === 'day' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              Week View
            </button>
          </div>
        </div>

        <div className="filter-container">
          <label className="form-label">
            {viewMode === 'day' ? 'Select Date' : 'Select Week Start Date'}
          </label>
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">Loading schedule...</p>
          </div>
        ) : viewMode === 'day' ? (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: '0.5rem',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {timeSlots.map((slot) => {
                const appointment = getAppointmentForSlot(selectedDate, slot);
                return (
                  <div key={slot} style={{ display: 'contents' }}>
                    <div style={{
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRight: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      textAlign: 'right'
                    }}>
                      {slot}
                    </div>
                    <div style={{
                      padding: appointment ? '0.75rem' : '0.5rem',
                      borderBottom: '1px solid var(--border-light)',
                      minHeight: '60px'
                    }}>
                      {appointment ? (
                        <div style={{
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, var(--primary-lighter) 0%, rgba(11, 83, 148, 0.05) 100%)',
                          border: '1px solid var(--primary-color)',
                          borderLeft: '3px solid var(--primary-color)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                          <div style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {appointment.patientName}
                          </div>
                          <div style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            {appointment.email}
                          </div>
                          {appointment.phone && (
                            <div style={{
                              fontSize: '0.8125rem',
                              color: 'var(--text-tertiary)'
                            }}>
                              📞 {appointment.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-light)',
                          fontStyle: 'italic'
                        }}>
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(7, 1fr)`,
              gap: '0.5rem',
              minWidth: '800px'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.75rem',
                background: 'var(--bg-tertiary)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
              }}>
                Time
              </div>
              {getWeekDates().map((date) => (
                <div key={date} style={{
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  borderLeft: '1px solid var(--border-color)'
                }}>
                  <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map((slot) => (
                <div key={slot} style={{ display: 'contents' }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    textAlign: 'right'
                  }}>
                    {slot}
                  </div>
                  {getWeekDates().map((date) => {
                    const appointment = getAppointmentForSlot(date, slot);
                    return (
                      <div
                        key={`${date}-${slot}`}
                        style={{
                          padding: appointment ? '0.5rem' : '0.25rem',
                          borderBottom: '1px solid var(--border-light)',
                          borderLeft: '1px solid var(--border-color)',
                          minHeight: '50px'
                        }}
                      >
                        {appointment ? (
                          <div style={{
                            padding: '0.5rem',
                            background: 'var(--primary-lighter)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem'
                          }}>
                            <div style={{
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              marginBottom: '0.25rem'
                            }}>
                              {appointment.patientName}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-tertiary)'
                            }}>
                              {appointment.time}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {getAppointmentsForDate(selectedDate).length === 0 && viewMode === 'day' && (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">No appointments scheduled for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleView;

