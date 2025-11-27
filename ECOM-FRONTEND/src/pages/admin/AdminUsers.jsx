import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/UI';
import apiClient from '../../api/apiClient';

const statusStyles = {
  APPROVED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
    {status}
  </span>
);

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const modalRoot = typeof document !== 'undefined' ? document.body : null;

const backdropStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 9999,
};

const cardBaseStyles = {
  width: '100%',
  maxWidth: '720px',
  borderRadius: '18px',
  backgroundColor: '#fff',
  boxShadow: '0 25px 60px rgba(15,23,42,0.25)',
  position: 'relative',
  padding: '2rem',
};

const Modal = ({ title, onClose, children, widthClass }) => {
  if (!modalRoot) return null;
  return createPortal(
    <div style={backdropStyles}>
      <div style={cardBaseStyles} className={widthClass}>
        <button
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            fontSize: '1.25rem',
            color: '#64748b',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
          }}
          aria-label="Close modal"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mb-4">
          <p className="text-sm uppercase tracking-wide text-secondary">Admin action</p>
          <h3 className="text-2xl font-semibold text-primary">{title}</h3>
        </div>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [actionId, setActionId] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [rejectUser, setRejectUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (filter === 'ALL') return users;
    return users.filter((user) => user.role === filter);
  }, [filter, users]);

  const tableUsers = useMemo(() => {
    const copy = [...filteredUsers];
    return copy.sort((a, b) => {
      const aPending = a.role === 'SELLER' && a.accountStatus === 'PENDING';
      const bPending = b.role === 'SELLER' && b.accountStatus === 'PENDING';
      if (aPending && !bPending) return -1;
      if (!aPending && bPending) return 1;
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [filteredUsers]);

  const pendingSellers = useMemo(
    () => users.filter((user) => user.role === 'SELLER' && user.accountStatus === 'PENDING'),
    [users]
  );

  const handleApproveSeller = async (userId) => {
    setActionId(userId);
    try {
      await apiClient.post(`/users/sellers/${userId}/approve`);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to approve seller');
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (user) => {
    setRejectUser(user);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectSeller = async () => {
    if (!rejectUser) return;
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.');
      return;
    }
    setRejectSubmitting(true);
    try {
      await apiClient.post(`/users/sellers/${rejectUser.id}/reject`, { reason: rejectReason.trim() });
      await fetchUsers();
      setRejectUser(null);
      setRejectReason('');
    } catch (err) {
      setRejectError(err.response?.data?.message || 'Failed to reject seller');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const openDetailModal = async (user) => {
    setDetailUser(user);
    setDetailLoading(true);
    setDetailError('');
    setDetailData(null);
    try {
      const response = await apiClient.get(`/users/${user.id}/details`);
      setDetailData(response.data);
    } catch (err) {
      setDetailError(err.response?.data?.message || 'Unable to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailUser(null);
    setDetailData(null);
    setDetailError('');
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading users..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">User Management</h1>
            <p className="admin-subtitle text-secondary">Approve sellers, review profiles, and manage access.</p>
          </div>
          <div className="admin-controls gap-2 flex items-center">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-select">
              <option value="ALL">All Users</option>
              <option value="USER">Customers</option>
              <option value="SELLER">Sellers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <button className="admin-btn admin-btn-secondary" onClick={fetchUsers}>
              Refresh
            </button>
          </div>
        </div>

        {/* {pendingSellers.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Pending seller approvals
                <span className="rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-semibold text-yellow-800">
                  {pendingSellers.length}
                </span>
              </h2>
              <span className="text-sm text-secondary">Review and respond before sellers can access catalog tools.</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingSellers.map((seller) => (
                <div key={seller.id} className="rounded-xl border border-yellow-200 bg-white p-5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-primary">{seller.name}</p>
                      <p className="text-sm text-secondary">{seller.email}</p>
                    </div>
                    <StatusBadge status={seller.accountStatus || 'PENDING'} />
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-secondary">
                    Requested {formatDate(seller.lastRequestAt || seller.createdAt)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="admin-btn admin-btn-success"
                      onClick={() => handleApproveSeller(seller.id)}
                      disabled={actionId === seller.id}
                    >
                      {actionId === seller.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button className="admin-btn admin-btn-danger" onClick={() => openRejectModal(seller)}>
                      Reject
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={() => openDetailModal(seller)}>
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )} */}

        {filteredUsers.length === 0 ? (
          <EmptyState title="No users found" description="No users match the current filter" />
        ) : (
          <div className="admin-table-container">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead className="admin-table-header">
                  <tr>
                    <th className="admin-table-th">User</th>
                    <th className="admin-table-th">Email</th>
                    <th className="admin-table-th">Role</th>
                    <th className="admin-table-th">Status</th>
                    <th className="admin-table-th">Joined</th>
                    <th className="admin-table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="admin-table-body">
                  {tableUsers.map((user) => (
                    <tr key={user.id} className="admin-table-row">
                      <td className="admin-table-td">
                        <div className="user-info">
                          <div className="user-avatar">
                            <span className="user-avatar-text">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            {user.role === 'SELLER' && (
                              <p className="text-xs text-secondary">Rejections: {user.rejectionCount || 0}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-td">
                        <span className="user-email">{user.email}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className={`role-badge role-badge-${user.role.toLowerCase()}`}>{user.role}</span>
                      </td>
                      <td className="admin-table-td">
                        {user.role === 'SELLER' ? <StatusBadge status={user.accountStatus || 'PENDING'} /> : '—'}
                      </td>
                      <td className="admin-table-td">
                        <span className="user-date">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="admin-table-td">
                        <div className="flex flex-wrap gap-2">
                          <button className="admin-btn admin-btn-secondary" onClick={() => openDetailModal(user)}>
                            View
                          </button>
                          {user.role === 'SELLER' && user.accountStatus === 'PENDING' && (
                            <>
                              <button
                                className="admin-btn admin-btn-success"
                                onClick={() => handleApproveSeller(user.id)}
                                disabled={actionId === user.id}
                              >
                                Approve
                              </button>
                              <button className="admin-btn admin-btn-danger" onClick={() => openRejectModal(user)}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {detailUser && (
        <Modal title={`User details`} onClose={closeDetailModal}>
          {detailLoading && <LoadingSpinner size="small" text="Loading details..." />}
          {detailError && <ErrorMessage message={detailError} />}
          {!detailLoading && !detailError && detailData && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-secondary">Name & Email</p>
                <p className="text-lg font-semibold">{detailData.user.name}</p>
                <p className="text-sm text-secondary break-all">{detailData.user.email}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-secondary">Role</p>
                  <p className="text-xl font-semibold">{detailData.user.role}</p>
                </div>
                {detailData.user.role === 'SELLER' && (
                  <div className="rounded-xl border p-4 flex flex-col gap-2">
                    <p className="text-sm text-secondary">Account status</p>
                    <StatusBadge status={detailData.user.accountStatus} />
                  </div>
                )}
              </div>

              {detailData.user.role === 'SELLER' && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-secondary">Products listed</p>
                    <p className="text-3xl font-bold text-primary">{detailData.productCount}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-secondary">Rejections</p>
                    <p className="text-3xl font-bold text-red-500">{detailData.rejectionCount}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-secondary">Last decision</p>
                    <p className="text-lg font-semibold">{detailData.user.accountStatus}</p>
                  </div>
                </div>
              )}

              {detailData.user.role === 'USER' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-secondary">Orders placed</p>
                    <p className="text-3xl font-bold text-primary">{detailData.orderCount}</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-secondary">Lifetime spend</p>
                    <p className="text-3xl font-bold text-primary">${detailData.totalSpend.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {detailData.user.lastRejectionReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">Last rejection reason</p>
                  <p className="text-sm text-red-600 mt-1">{detailData.user.lastRejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {rejectUser && (
        <Modal title={`Reject seller`} onClose={() => setRejectUser(null)} widthClass="max-w-lg">
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-secondary">Seller</p>
              <p className="text-lg font-semibold">{rejectUser.name}</p>
              <p className="text-sm text-secondary break-all">{rejectUser.email}</p>
            </div>
            <div>
              <label className="form-label">Reason for rejection</label>
              <textarea
                className="form-input h-28 resize-none"
                placeholder="Let the seller know what needs to change..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError('');
                }}
              />
              {rejectError && <ErrorMessage message={rejectError} />}
            </div>
            <div className="flex justify-end gap-2">
              <button className="admin-btn admin-btn-secondary" onClick={() => setRejectUser(null)}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleRejectSeller}
                disabled={rejectSubmitting}
              >
                {rejectSubmitting ? 'Rejecting...' : 'Send rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;


