import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { billAPI } from '../../services/api.js';

function MyBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBills();
  }, [user?.email]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const result = await billAPI.getAll({ email: user?.email });
      if (result.success && result.data) {
        setBills(result.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = filterStatus === 'all'
    ? bills
    : bills.filter(bill => bill.status === filterStatus);

  const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0);
  const unpaidAmount = bills
    .filter(bill => bill.status === 'pending' || bill.status === 'partial')
    .reduce((sum, bill) => sum + (bill.total || 0), 0);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">My Bills</h1>
          <p className="card-subtitle">View and manage your medical bills</p>
        </div>

        {/* Summary Cards */}
        {bills.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Total Bills
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {bills.length}
              </div>
            </div>
            <div style={{
              padding: '1rem',
              background: 'rgba(243, 156, 18, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(243, 156, 18, 0.3)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#f39c12', marginBottom: '0.5rem', fontWeight: '500' }}>
                Unpaid Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f39c12' }}>
                ${unpaidAmount.toFixed(2)}
              </div>
            </div>
            <div style={{
              padding: '1rem',
              background: 'rgba(22, 160, 133, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(22, 160, 133, 0.3)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#16a085', marginBottom: '0.5rem', fontWeight: '500' }}>
                Total Amount
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a085' }}>
                ${totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {bills.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1rem'
          }}>
            {[
              { value: 'all', label: 'All Bills' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'partial', label: 'Partial' }
            ].map(({ value, label }) => {
              const count = value === 'all' 
                ? bills.length 
                : bills.filter(b => b.status === value).length;
              
              return (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: filterStatus === value ? 'var(--primary-color)' : 'transparent',
                    color: filterStatus === value ? 'white' : 'var(--text-secondary)',
                    fontWeight: filterStatus === value ? '600' : '500',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Bills List */}
        {loading ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <p className="empty-state-text">Loading bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H16V13H8V11Z" fill="var(--text-light)"/>
              </svg>
            </div>
            <p className="empty-state-text">
              {filterStatus === 'all' 
                ? 'No bills found. Bills will appear here when they are issued by the hospital.' 
                : `No ${filterStatus} bills found.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBills.map((bill) => {
              const billId = bill._id || bill.id;
              const statusColors = {
                pending: { bg: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', text: 'Pending Payment' },
                paid: { bg: 'rgba(22, 160, 133, 0.1)', color: '#16a085', text: 'Paid' },
                partial: { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db', text: 'Partially Paid' },
                cancelled: { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', text: 'Cancelled' }
              };
              const statusStyle = statusColors[bill.status] || statusColors.pending;

              return (
                <div
                  key={billId}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `3px solid ${statusStyle.color}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        Bill #{billId.toString().slice(-8)}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem'
                      }}>
                        Issued: {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                      {bill.dueDate && (
                        <div style={{
                          fontSize: '0.875rem',
                          color: bill.status === 'pending' && new Date(bill.dueDate) < new Date() ? '#e74c3c' : 'var(--text-secondary)',
                          fontWeight: bill.status === 'pending' && new Date(bill.dueDate) < new Date() ? '600' : 'normal'
                        }}>
                          Due Date: {new Date(bill.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {bill.status === 'pending' && new Date(bill.dueDate) < new Date() && (
                            <span style={{ marginLeft: '0.5rem', color: '#e74c3c' }}>⚠️ Overdue</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--primary-color)',
                        marginBottom: '0.5rem'
                      }}>
                        ${bill.total?.toFixed(2) || '0.00'}
                      </div>
                      <span style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.color}40`,
                        textTransform: 'uppercase'
                      }}>
                        {statusStyle.text}
                      </span>
                    </div>
                  </div>

                  {bill.items && bill.items.length > 0 && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                        Bill Details:
                      </div>
                      {bill.items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: idx < bill.items.length - 1 ? '1px solid var(--border-light)' : 'none'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {item.description} {item.quantity > 1 && `(×${item.quantity})`}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            ${item.total?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      ))}
                      {bill.tax > 0 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderTop: '1px solid var(--border-light)',
                          marginTop: '0.5rem',
                          paddingTop: '0.75rem'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Tax:</span>
                          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            ${bill.tax?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      )}
                      {bill.discount > 0 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Discount:</span>
                          <span style={{ fontWeight: '600', color: '#16a085' }}>
                            -${bill.discount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0',
                        borderTop: '2px solid var(--border-color)',
                        marginTop: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: 'var(--primary-color)'
                      }}>
                        <span>Total:</span>
                        <span>${bill.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  )}

                  {bill.notes && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      <strong>Note: </strong>{bill.notes}
                    </div>
                  )}

                  {bill.paymentMethod && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong>Payment Method: </strong>
                      <span style={{ textTransform: 'capitalize' }}>{bill.paymentMethod}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBills;


