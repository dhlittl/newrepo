"use client";

import { useState, useEffect } from 'react';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';

export default function NotificationPreferences() {
  const { userId, isAssumed } = useEffectiveDriverId();
  const router = useRouter();
  
  const [preferences, setPreferences] = useState({
    pointsUpdateNotifications: true,
    orderStatusNotifications: true,
    orderProblemNotifications: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Update the useEffect that fetches preferences
  useEffect(() => {
    if (!userId) return;
    
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-DriverNotificationPreferences?userId=${userId}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch notification preferences');
        }
        
        const data = await response.json();
        
        setPreferences({
          pointsUpdateNotifications: data.preferences?.Points_Update_Notifications === 1,
          orderStatusNotifications: data.preferences?.Order_Status_Notifications === 1,
          orderProblemNotifications: data.preferences?.Order_Problem_Notifications === 1
        });
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [userId]);
  
  // Handle toggling a preference
  const handleTogglePreference = (preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };
  
  // Update the save function
  const handleSavePreferences = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');
      
      const response = await fetch(
        'https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-DriverNotificationPreferences',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            pointsUpdateNotifications: preferences.pointsUpdateNotifications,
            orderStatusNotifications: preferences.orderStatusNotifications,
            orderProblemNotifications: preferences.orderProblemNotifications
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save notification preferences');
      }
      
      setSuccessMessage('Your notification preferences have been saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  // Return button for sponsor users who are impersonating a driver
  const handleReturnToSponsor = () => {
    sessionStorage.removeItem("assumedDriverId");
    sessionStorage.removeItem("assumedDriverName");
    router.push("/pages/sponsor/drivers");
  };
  
  if (!userId) {
    return <div className="text-center p-8">Loading user information...</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
      
      {/* Return button for sponsors */}
      {isAssumed && (
        <button
          className="mb-4 text-sm text-gray-700 underline"
          onClick={handleReturnToSponsor}
        >
          ← Return to Sponsor View
        </button>
      )}
      
      {loading ? (
        <div className="text-center p-8">Loading preferences...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Manage which notifications you receive from the Good Driver Incentive Program.
            </p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Points Update Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive email notifications when your points balance changes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.pointsUpdateNotifications}
                  onChange={() => handleTogglePreference('pointsUpdateNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Order Status Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive email notifications when your order status changes (approved, denied, etc.)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.orderStatusNotifications}
                  onChange={() => handleTogglePreference('orderStatusNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Order Problem Notifications</h3>
                <p className="text-sm text-gray-600">
                  Receive email notifications about order issues (insufficient points, errors, etc.)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={preferences.orderProblemNotifications}
                  onChange={() => handleTogglePreference('orderProblemNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
              onClick={handleSavePreferences}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}