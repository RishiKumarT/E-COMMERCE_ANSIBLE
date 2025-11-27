import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../../components/UI';
import apiClient from '../../api/apiClient';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.put(`/users/${user.id}`, {
        name: formData.name,
        email: formData.email
      });

      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">

        {/* Main Card */}
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-primary">Profile Settings</h1>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name & Email */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  Account Type
                </label>
                <input
                  type="text"
                  name="role"
                  id="role"
                  value={formData.role}
                  disabled
                  className="form-input bg-gray-100 text-gray-500"
                />
                <p className="text-sm text-muted mt-1">Account type cannot be changed</p>
              </div>

              {/* Error & Success Messages */}
              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
