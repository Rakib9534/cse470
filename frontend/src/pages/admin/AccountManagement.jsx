import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { userAPI } from '../../services/api.js';

function AccountManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters = filterRole !== 'all' ? { role: filterRole } : {};
      const result = await userAPI.getAll(filters);
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setUsers([]);
        setMessage('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setMessage('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    // Prevent deleting own account
    if (userId === currentUser?.id) {
      setMessage('You cannot delete your own account');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${userName}'s account? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(userId);
      const result = await userAPI.delete(userId);
      if (result.success) {
        setMessage(`Account deleted successfully`);
        // Remove user from list
        setUsers(users.filter(u => (u._id || u.id) !== userId));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to delete account');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Error deleting account');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return { background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)' };
      case 'doctor':
        return { background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' };
      case 'patient':
        return { background: 'rgba(22, 160, 133, 0.1)', color: '#16a085', border: '1px solid rgba(22, 160, 133, 0.3)' };
      default:
        return { background: 'rgba(149, 165, 166, 0.1)', color: '#95a5a6', border: '1px solid rgba(149, 165, 166, 0.3)' };
    }
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    patient: users.filter(u => u.role === 'patient').length
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Account Management</h1>
          <p className="card-subtitle">Manage all user accounts in the system</p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '1rem'
        }}>
          {[
            { value: 'all', label: 'All Users' },
            { value: 'admin', label: 'Admins' },
            { value: 'doctor', label: 'Doctors' },
            { value: 'patient', label: 'Patients' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterRole(value)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: filterRole === value ? 'var(--primary-color)' : 'transparent',
                color: filterRole === value ? 'white' : 'var(--text-secondary)',
                fontWeight: filterRole === value ? '600' : '500',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                borderBottom: filterRole === value ? '2px solid var(--primary-color)' : '2px solid transparent'
              }}
            >
              {label} ({roleCounts[value]})
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">Loading accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">No accounts found</p>
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {users.map((user) => {
              const userId = user._id || user.id;
              const isCurrentUser = userId === currentUser?.id;
              const roleBadge = getRoleBadgeColor(user.role);
              
              return (
                <div
                  key={userId}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        {user.name}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        ...roleBadge
                      }}>
                        {user.role}
                      </span>
                      {isCurrentUser && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: 'rgba(52, 152, 219, 0.1)',
                          color: '#3498db',
                          border: '1px solid rgba(52, 152, 219, 0.3)'
                        }}>
                          You
                        </span>
                      )}
                      {user.isActive === false && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: 'rgba(149, 165, 166, 0.1)',
                          color: '#95a5a6',
                          border: '1px solid rgba(149, 165, 166, 0.3)'
                        }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Email: </span>
                        <span style={{ color: 'var(--text-primary)' }}>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Phone: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{user.phone}</span>
                        </div>
                      )}
                      {user.speciality && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Speciality: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{user.speciality}</span>
                        </div>
                      )}
                      {user.department && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Department: </span>
                          <span style={{ color: 'var(--text-primary)' }}>{user.department}</span>
                        </div>
                      )}
                      {user.createdAt && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Joined: </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleDelete(userId, user.name)}
                        disabled={deletingId === userId}
                        style={{
                          padding: '0.5rem 1rem',
                          border: 'none',
                          background: deletingId === userId ? 'var(--text-tertiary)' : '#e74c3c',
                          color: 'white',
                          borderRadius: 'var(--radius-md)',
                          cursor: deletingId === userId ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          opacity: deletingId === userId ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== userId) {
                            e.target.style.background = '#c0392b';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== userId) {
                            e.target.style.background = '#e74c3c';
                          }
                        }}
                      >
                        {deletingId === userId ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountManagement;
