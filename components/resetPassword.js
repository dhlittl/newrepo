'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmResetPassword } from 'aws-amplify/auth';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    verificationCode: '',
    newPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const username = searchParams.get('username');
    if (username) {
      setFormData((prev) => ({ ...prev, username }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.verificationCode.trim())
      newErrors.verificationCode = 'Verification code is required';
    if (!formData.newPassword.trim())
      newErrors.newPassword = 'New password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await confirmResetPassword({
        username: formData.username,
        confirmationCode: formData.verificationCode,
        newPassword: formData.newPassword,
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/pages/login'), 2500);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ auth: error.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-black mb-4">Reset Password</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm bg-white p-6 shadow-md rounded-lg"
      >
        <div>
          <label className="block text-sm font-medium text-black">Email</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your email"
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            Verification Code
          </label>
          <input
            type="text"
            value={formData.verificationCode}
            onChange={(e) =>
              setFormData({ ...formData, verificationCode: e.target.value })
            }
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter the code from your email"
          />
          {errors.verificationCode && (
            <p className="text-red-500 text-sm">{errors.verificationCode}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black">
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className="mt-1 p-2 w-full border rounded-md text-black"
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword}</p>
          )}
        </div>

        {errors.auth && (
          <p className="text-red-500 text-sm">{errors.auth}</p>
        )}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md w-full text-lg"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
