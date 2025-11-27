import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { ErrorMessage, LoadingSpinner, SuccessMessage } from '../../components/UI';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess('If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-primary">
            Forgot your password?
          </h2>
          <p className="text-center text-sm text-secondary">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? <LoadingSpinner size="small" text="" /> : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary">
          Remembered it?{' '}
          <Link to="/login" className="text-primary font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


