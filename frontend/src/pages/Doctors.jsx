function Doctors({ doctors }) {
  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Available Doctors &amp; Time Slots</h1>
          <p className="card-subtitle">Browse our medical professionals and their available appointment times</p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="doctor-card">
              <div className="doctor-name">{doc.name}</div>
              <div className="doctor-speciality">{doc.speciality}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Available Time Slots:
                </strong>
                <div className="slots-container">
                  {doc.slots.length > 0 ? (
                    doc.slots.map((slot) => (
                      <span key={slot} className="slot-badge">
                        {slot}
                      </span>
                    ))
                  ) : (
                    <span className="slot-badge" style={{ color: 'var(--text-light)' }}>
                      No slots available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;