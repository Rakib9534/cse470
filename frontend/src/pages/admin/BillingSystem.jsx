import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { billAPI, userAPI } from '../../services/api.js';

function BillingSystem() {
  const { user: currentUser } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    patientEmail: '',
    patientName: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    tax: 0,
    discount: 0,
    status: 'pending',
    paymentMethod: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const result = await billAPI.getAll();
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

  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      const result = await userAPI.getAll({ role: 'patient' });
      if (result.success && result.data) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handlePatientSelect = (email) => {
    const patient = patients.find(p => p.email === email);
    if (patient) {
      setFormData({
        ...formData,
        patientEmail: patient.email,
        patientName: patient.name
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value
    };
    
    // Calculate total for this item
    newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = parseFloat(formData.tax) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setCreating(true);

    if (!formData.patientEmail) {
      setMessage('Please select a patient');
      setCreating(false);
      return;
    }

    if (formData.items.some(item => !item.description || item.total <= 0)) {
      setMessage('Please fill in all bill items with valid amounts');
      setCreating(false);
      return;
    }

    try {
      const totals = calculateTotals();
      const billData = {
        ...formData,
        ...totals,
        billDate: new Date().toISOString(),
        dueDate: formData.dueDate || undefined
      };

      const result = await billAPI.create(billData);
      
      if (result.success) {
        setMessage('Bill created successfully! Notification sent to patient.');
        // Reset form
        setFormData({
          patientEmail: '',
          patientName: '',
          items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
          tax: 0,
          discount: 0,
          status: 'pending',
          paymentMethod: '',
          dueDate: '',
          notes: ''
        });
        setShowCreateForm(false);
        // Refresh bills list
        await fetchBills();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to create bill');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setMessage('Error creating bill: ' + (error.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const filteredBills = searchTerm
    ? bills.filter(bill => 
        bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill._id?.toString().includes(searchTerm)
      )
    : bills;

  const totals = calculateTotals();

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 className="card-title">Billing System</h1>
            <p className="card-subtitle">Create and manage patient bills</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            {showCreateForm ? '✕ Cancel' : '+ Create New Bill'}
          </button>
        </div>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}

        {/* Create Bill Form */}
        {showCreateForm && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Create New Bill
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Patient Selection */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Select Patient <span className="required">*</span>
                </label>
                {patientsLoading ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading patients...
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={formData.patientEmail}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map((patient) => (
                      <option key={patient._id || patient.id} value={patient.email}>
                        {patient.name} ({patient.email})
                      </option>
                    ))}
                  </select>
                )}
                {formData.patientName && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Selected: <strong>{formData.patientName}</strong>
                  </div>
                )}
              </div>

              {/* Bill Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Bill Items <span className="required">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {formData.items.map((item, index) => (
                    <div key={index} style={{
                      padding: '1rem',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                      gap: '1rem',
                      alignItems: 'end'
                    }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                        <input
                          type="text"
                          className="form-input"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Service/item description"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantity</label>
                        <input
                          type="number"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          step="1"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Unit Price</label>
                        <input
                          type="number"
                          className="form-input"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Total</label>
                        <input
                          type="text"
                          className="form-input"
                          value={item.total.toFixed(2)}
                          readOnly
                          style={{ background: 'var(--bg-secondary)', fontWeight: '600' }}
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          style={{
                            padding: '0.5rem',
                            border: 'none',
                            background: '#e74c3c',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            height: 'fit-content'
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax, Discount, Totals */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div className="form-group">
                  <label className="form-label">Tax Amount</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>

              {/* Totals Summary */}
              <div style={{
                padding: '1rem',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <strong>${totals.subtotal.toFixed(2)}</strong>
                </div>
                {totals.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tax:</span>
                    <strong>${totals.tax.toFixed(2)}</strong>
                  </div>
                )}
                {totals.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Discount:</span>
                    <strong style={{ color: '#16a085' }}>-${totals.discount.toFixed(2)}</strong>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid var(--border-color)',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: 'var(--primary-color)'
                }}>
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes or instructions..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn btn-secondary"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating Bill...' : 'Create Bill & Notify Patient'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bills List */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              All Bills ({filteredBills.length})
            </h2>
            <input
              type="text"
              className="form-input"
              placeholder="Search by patient name, email, or bill ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px', fontSize: '0.875rem' }}
            />
          </div>

          {loading ? (
            <div className="empty-state" style={{ marginTop: '2rem' }}>
              <p className="empty-state-text">Loading bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="empty-state" style={{ marginTop: '2rem' }}>
              <p className="empty-state-text">
                {searchTerm ? 'No bills found matching your search' : 'No bills found. Create your first bill above.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredBills.map((bill) => {
                const billId = bill._id || bill.id;
                const statusColors = {
                  pending: { bg: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' },
                  paid: { bg: 'rgba(22, 160, 133, 0.1)', color: '#16a085' },
                  partial: { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' },
                  cancelled: { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }
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
                          {bill.patientName}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.5rem'
                        }}>
                          {bill.patientEmail}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          fontFamily: 'monospace'
                        }}>
                          Bill ID: {billId.toString().slice(-8)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.5rem',
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
                          {bill.status || 'pending'}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Bill Date: </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {bill.dueDate && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Due Date: </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {new Date(bill.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {bill.paymentMethod && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Payment: </span>
                          <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {bill.paymentMethod}
                          </span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Items: </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {bill.items?.length || 0}
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
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          Bill Items:
                        </div>
                        {bill.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                            borderBottom: idx < bill.items.length - 1 ? '1px solid var(--border-light)' : 'none'
                          }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {item.description} (Qty: {item.quantity})
                            </span>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              ${item.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        ))}
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
                        <strong>Notes: </strong>{bill.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BillingSystem;
