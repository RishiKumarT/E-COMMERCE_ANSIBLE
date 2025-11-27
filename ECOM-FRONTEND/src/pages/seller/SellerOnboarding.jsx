import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import apiClient from '../../api/apiClient';
import { ErrorMessage, SuccessMessage } from '../../components/UI';

const statusCopy = {
  PENDING: {
    label: 'Pending Review',
    description: 'Your request is waiting for admin approval. We will notify you by email once it is processed.',
    color: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  APPROVED: {
    label: 'Approved',
    description: 'You can now access all seller capabilities.',
    color: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Please review the reason below and resubmit your request when ready.',
    color: 'text-red-600',
    badge: 'bg-red-100 text-red-800',
  },
};

const SellerOnboarding = () => {
  const { user, refreshUserFromServer } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    refreshUserFromServer().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return null;
  }

  const currentStatus = statusCopy[user.accountStatus] || statusCopy.PENDING;
  const canRequest = user.accountStatus === 'REJECTED' && !user.approvalRequested;

  const handleRequestApproval = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/users/sellers/request-approval');
      await refreshUserFromServer();
      setSuccess('Approval request submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="seller-onboarding min-h-screen bg-surface py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary mb-1">Approval Status</p>
            <h1 className={`text-3xl font-bold ${currentStatus.color}`}>{currentStatus.label}</h1>
            <p className="text-secondary mt-2">{currentStatus.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${currentStatus.badge}`}>
            {user.accountStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-secondary">Rejection Count</p>
            <p className="text-3xl font-semibold mt-1">{user.rejectionCount}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-secondary">Last Decision</p>
            <p className="text-lg font-medium mt-1">
              {user.lastRejectionReason ? 'Rejected' : user.accountStatus}
            </p>
          </div>
        </div>

        {user.lastRejectionReason && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm font-semibold text-red-700 mb-2">Last Rejection Reason</p>
            <p className="text-sm text-red-600">{user.lastRejectionReason}</p>
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="flex flex-wrap gap-3">
          {canRequest && (
            <button
              onClick={handleRequestApproval}
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Requesting...' : 'Request Approval'}
            </button>
          )}
          {user.accountStatus === 'PENDING' && (
            <span className="text-sm text-secondary">
              Your request is currently being reviewed by the admin team.
            </span>
          )}
          {user.accountStatus === 'APPROVED' && (
            <Link to="/seller/dashboard" className="btn btn-secondary">
              Go to Seller Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOnboarding;

