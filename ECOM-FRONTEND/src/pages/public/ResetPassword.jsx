import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { ErrorMessage, LoadingSpinner, SuccessMessage } from '../../components/UI';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token missing. Please use the link from your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setSuccess('Password updated successfully. You can now log in.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-primary">
            Set a new password
          </h2>
          <p className="text-center text-sm text-secondary">
            Choose a strong password to secure your account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="********"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="********"
            />
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? <LoadingSpinner size="small" text="" /> : 'Reset password'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary">
          Go back to{' '}
          <Link to="/login" className="text-primary font-medium">
            login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;


