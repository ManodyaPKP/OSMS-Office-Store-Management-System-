import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { Button, Alert, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ApprovalsPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [deptId, setDeptId] = useState('');

  // Check authorization
  useEffect(() => {
    if (!hasRole(['admin'])) {
      navigate('/');
    }
  }, [hasRole, navigate]);

  // Load pending registrations
  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getPendingRegistrations();
      setRegistrations(response.data.data || []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await authAPI.approveRegistration(selectedRegistration.id, deptId);
      setSuccess('✅ Registration approved successfully!');
      setActionModal(null);
      setSelectedRegistration(null);
      fetchPendingRegistrations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await authAPI.rejectRegistration(selectedRegistration.id, notes);
      setSuccess('✅ Registration rejected successfully!');
      setActionModal(null);
      setSelectedRegistration(null);
      setNotes('');
      fetchPendingRegistrations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (reg) => {
    setSelectedRegistration(reg);
    setActionModal('approve');
    setDeptId('');
  };

  const openRejectModal = (reg) => {
    setSelectedRegistration(reg);
    setActionModal('reject');
    setNotes('');
  };

  const userTypeLabel = {
    staff: '👤 Staff Member',
    technician: '🔧 Technician',
    other: '🌐 Other'
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📋 Registration Approvals</h1>
        <p className="text-slate-600 mt-1">Review and manage pending user registrations</p>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger" icon="⚠️">{error}</Alert>}
      {success && <Alert variant="success" icon="✅">{success}</Alert>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-600">
          <div className="text-sm text-slate-600">Pending Applications</div>
          <div className="text-3xl font-bold text-cyan-600 mt-2">{registrations.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="text-sm text-slate-600">Staff</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {registrations.filter(r => r.user_type === 'staff').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
          <div className="text-sm text-slate-600">Technicians</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {registrations.filter(r => r.user_type === 'technician').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="text-sm text-slate-600">Other</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {registrations.filter(r => r.user_type === 'other').length}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {registrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
          <p className="text-slate-600">No pending registrations at this time.</p>
        </div>
      ) : (
        /* Registrations List */
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    {/* Basic Info */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {reg.user_type === 'staff' ? '👤' : reg.user_type === 'technician' ? '🔧' : '🌐'}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {reg.first_name} {reg.last_name}
                          </h3>
                          <p className="text-sm text-slate-600">{userTypeLabel[reg.user_type]}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-600">Username</span>
                        <p className="font-mono text-slate-900">{reg.username}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Email</span>
                        <p className="text-slate-900">{reg.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Mobile</span>
                        <p className="text-slate-900">{reg.mobile_number}</p>
                      </div>
                    </div>

                    {/* Role-Specific Details */}
                    {reg.user_type === 'staff' && (
                      <div className="bg-blue-50 rounded p-3 text-sm mb-4 border border-blue-200">
                        <p><span className="font-semibold">Department:</span> {reg.department_name || 'N/A'}</p>
                        <p><span className="font-semibold">Position:</span> {reg.position || 'N/A'}</p>
                        {reg.section_name && <p><span className="font-semibold">Section:</span> {reg.section_name}</p>}
                        {reg.unit_name && <p><span className="font-semibold">Unit:</span> {reg.unit_name}</p>}
                      </div>
                    )}

                    {reg.user_type === 'technician' && (
                      <div className="bg-orange-50 rounded p-3 text-sm mb-4 border border-orange-200">
                        <p><span className="font-semibold">Company/Shop:</span> {reg.company_shop_name || 'N/A'}</p>
                        <p><span className="font-semibold">Phone:</span> {reg.company_phone || 'N/A'}</p>
                        <p><span className="font-semibold">Address:</span> {reg.address || 'N/A'}</p>
                      </div>
                    )}

                    {reg.user_type === 'other' && (
                      <div className="bg-purple-50 rounded p-3 text-sm mb-4 border border-purple-200">
                        <p><span className="font-semibold">ID Number:</span> {reg.id_number || 'N/A'}</p>
                        <p><span className="font-semibold">Note:</span> {reg.registration_note}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-slate-500">
                      Applied: {new Date(reg.created_at).toLocaleDateString()} at {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => openApproveModal(reg)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      ✅ Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openRejectModal(reg)}
                      disabled={loading}
                      className="whitespace-nowrap"
                    >
                      ❌ Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {actionModal === 'approve' && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">✅ Approve Registration</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to approve <span className="font-semibold">{selectedRegistration.first_name} {selectedRegistration.last_name}</span>'s registration?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Department (Optional)
              </label>
              <input
                type="text"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                placeholder="Enter department ID or leave blank"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionModal === 'reject' && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">❌ Reject Registration</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to reject <span className="font-semibold">{selectedRegistration.first_name} {selectedRegistration.last_name}</span>'s registration?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide optional reason for rejection..."
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
