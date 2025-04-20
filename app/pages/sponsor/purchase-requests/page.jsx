"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PurchaseRequestsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [sponsorId, setSponsorId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [cognitoSub, setCognitoSub] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [processingAction, setProcessingAction] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Processing'); // 'Processing', 'Approved', 'Denied', 'Cancelled'
  const [activeDriverFilter, setActiveDriverFilter] = useState('all');
  const [uniqueDrivers, setUniqueDrivers] = useState([]);
  const [driverUserIdsCache, setDriverUserIdsCache] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session for group information
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];

        if (!groups.includes("sponsor") && !groups.includes("admin")) {
          router.replace("/unauthorized");
          return;
        }

        setAuthorized(true);
        
        // Get current user for the Cognito sub
        const user = await getCurrentUser();
        const sub = user.userId;
        setCognitoSub(sub);
        
        // Get database User_ID from Cognito sub
        const userIdResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${sub}`);
        
        if (!userIdResponse.ok) {
          throw new Error("Failed to fetch user ID from Cognito sub");
        }
        
        const userIdData = await userIdResponse.json();
        setUserId(userIdData.userId);
        
        // Get sponsor ID from user info
        const sponsorUserResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/sponsorUsers/Info?userId=${userIdData.userId}`);
        
        if (!sponsorUserResponse.ok) {
          throw new Error("Failed to fetch sponsor user info");
        }
        
        const sponsorUserData = await sponsorUserResponse.json();
        setSponsorId(sponsorUserData.Sponsor_Org_ID);
        
        // Now that we have the sponsor ID, fetch purchase requests
        fetchPurchaseRequests(sponsorUserData.Sponsor_Org_ID, activeFilter);
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  useEffect(() => {
    if (sponsorId) {
      fetchPurchaseRequests(sponsorId, activeFilter);
    }
  }, [sponsorId, activeFilter]);
  
  const fetchPurchaseRequests = async (sponsorOrgId, status = 'Processing') => {
    try {
      setLoading(true);
      
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/status?sponsorId=${sponsorOrgId}&status=${status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase requests: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.purchases && Array.isArray(data.purchases)) {
        // Extract driverIds to fetch user IDs
        const driverIds = data.purchases.map(purchase => purchase.driverId);
        
        // For each unique driverId, get the user ID if not already in cache
        for (const driverId of new Set(driverIds)) {
          if (!driverUserIdsCache[driverId]) {
            try {
              // In this system, the Driver_ID is the same as User_ID
              setDriverUserIdsCache(prev => ({
                ...prev,
                [driverId]: driverId // Set the userId to the same as driverId
              }));
            } catch (err) {
              console.error(`Error getting user ID for driver ${driverId}:`, err);
            }
          }
        }
        
        setPurchaseRequests(data.purchases);
        
        // Extract unique drivers for the driver filter
        const drivers = data.purchases.reduce((acc, purchase) => {
          const driverId = purchase.driverId;
          const driverName = `${purchase.driverFirstName} ${purchase.driverLastName}`;
          
          if (!acc.some(d => d.id === driverId)) {
            acc.push({
              id: driverId,
              name: driverName,
              email: purchase.driverEmail
            });
          }
          
          return acc;
        }, []);
        
        setUniqueDrivers(drivers);
      } else {
        setPurchaseRequests([]);
        setUniqueDrivers([]);
      }
    } catch (err) {
      console.error("Error fetching purchase requests:", err);
      setPurchaseRequests([]);
      setUniqueDrivers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExpandOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };
  
  // Check if a driver has notifications enabled
  const checkDriverNotificationPreference = async (driverId, preferenceType) => {
    try {
      // Get the user ID for this driver (same as driver ID in your system)
      const driverUserId = driverUserIdsCache[driverId] || driverId;
      
      console.log(`Checking notification preferences for driver ${driverId}, using userId ${driverUserId}`);
      
      // Get driver notification preferences
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-DriverNotificationPreferences?userId=${driverUserId}`
      );
      
      if (!response.ok) {
        console.error(`Failed to retrieve notification preferences for driver ${driverId}, status:`, response.status);
        // Default to true if we can't fetch preferences
        return true;
      }
      
      const data = await response.json();
      console.log(`Retrieved notification preferences for driver ${driverId}:`, data);
      
      // Check the specific preference type
      switch (preferenceType) {
        case 'orderStatus':
          return data.preferences?.Order_Status_Notifications !== 0;
        case 'orderProblem':
          return data.preferences?.Order_Problem_Notifications !== 0;
        case 'pointsUpdate':
          return data.preferences?.Points_Update_Notifications !== 0;
        default:
          return true; // Default to true for unknown preference types
      }
    } catch (err) {
      console.error(`Error checking notification preferences for driver ${driverId}:`, err);
      // Default to true if error occurs
      return true;
    }
  };
  
  // Modified handleApproveOrder function with email notification
  const handleApproveOrder = async (orderId) => {
    try {
      setProcessingAction(orderId);
      
      // Find the purchase in our state to get driver email and details
      const purchase = purchaseRequests.find(p => p.purchaseId === orderId);
      if (!purchase) {
        throw new Error('Purchase not found in current data');
      }
      
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseId: orderId,
          status: 'Approved',
          userId: cognitoSub,
          isSponsor: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve order');
      }
      
      // Check if the driver wants to receive order status notifications
      const shouldSendEmail = await checkDriverNotificationPreference(purchase.driverId, 'orderStatus');
      
      if (shouldSendEmail) {
        // Create and send approval email to the driver
        const emailSubject = `Order Approved: Your order #${orderId} has been approved`;
        
        let emailBody = `
          <html>
            <body>
              <h2>Order Approved</h2>
              <p>Good news! Your order with ${purchase.sponsorName || 'your sponsor'} has been approved:</p>
              <p><strong>Order #:</strong> ${orderId}</p>
              <p><strong>Date Placed:</strong> ${formatDate(purchase.orderDate)}</p>
              <p><strong>Total Points:</strong> ${purchase.totalPoints.toLocaleString()}</p>
              
              <h3>Order Details:</h3>
              <table border="1" cellpadding="5">
                <tr>
                  <th>Item</th>
                  <th>Price (Points)</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
        `;
        
        // Add each item to the email
        purchase.items.forEach(item => {
          emailBody += `
            <tr>
              <td>${item.productName}</td>
              <td>${item.pointPrice}</td>
              <td>${item.quantity}</td>
              <td>${item.totalPointPrice}</td>
            </tr>
          `;
        });
        
        emailBody += `
              </table>
              <p><strong>Note:</strong> Points have been deducted from your balance.</p>
            </body>
          </html>
        `;
        
        // Send the approval email to the driver
        await sendDriverAlertEmail(purchase.driverEmail, emailSubject, emailBody);
      } else {
        console.log(`Driver ${purchase.driverId} has disabled order status notifications, skipping email`);
      }
      
      alert('Order approved successfully');
      
      // Refresh the order list
      fetchPurchaseRequests(sponsorId, activeFilter);
    } catch (err) {
      console.error('Error approving order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Modified handleDenyOrder function with email notification
  const handleDenyOrder = async (orderId) => {
    try {
      setProcessingAction(orderId);
      
      // Find the purchase in our state to get driver email and details
      const purchase = purchaseRequests.find(p => p.purchaseId === orderId);
      if (!purchase) {
        throw new Error('Purchase not found in current data');
      }
      
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseId: orderId,
          status: 'Denied',
          userId: cognitoSub,
          isSponsor: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deny order');
      }
      
      // Check if the driver wants to receive order status notifications
      const shouldSendEmail = await checkDriverNotificationPreference(purchase.driverId, 'orderStatus');
      
      if (shouldSendEmail) {
        // Create and send denial email to the driver
        const emailSubject = `Order Denied: Your order #${orderId} has been denied`;
        
        let emailBody = `
          <html>
            <body>
              <h2>Order Denied</h2>
              <p>We're sorry, but your order with ${purchase.sponsorName || 'your sponsor'} has been denied:</p>
              <p><strong>Order #:</strong> ${orderId}</p>
              <p><strong>Date Placed:</strong> ${formatDate(purchase.orderDate)}</p>
              <p><strong>Total Points:</strong> ${purchase.totalPoints.toLocaleString()}</p>
              
              <h3>Order Details:</h3>
              <table border="1" cellpadding="5">
                <tr>
                  <th>Item</th>
                  <th>Price (Points)</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
        `;
        
        // Add each item to the email
        purchase.items.forEach(item => {
          emailBody += `
            <tr>
              <td>${item.productName}</td>
              <td>${item.pointPrice}</td>
              <td>${item.quantity}</td>
              <td>${item.totalPointPrice}</td>
            </tr>
          `;
        });
        
        emailBody += `
              </table>
              <p><strong>Note:</strong> No points have been deducted from your balance.</p>
              <p>If you have questions about why your order was denied, please contact your sponsor.</p>
            </body>
          </html>
        `;
        
        // Send the denial email to the driver
        await sendDriverAlertEmail(purchase.driverEmail, emailSubject, emailBody);
      } else {
        console.log(`Driver ${purchase.driverId} has disabled order status notifications, skipping email`);
      }
      
      alert('Order denied successfully');
      
      // Refresh the order list
      fetchPurchaseRequests(sponsorId, activeFilter);
    } catch (err) {
      console.error('Error denying order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Add a function to send alert emails to drivers
  const sendDriverAlertEmail = async (driverEmail, subject, body) => {
    try {
      console.log("Sending alert email to driver:", driverEmail);
      
      // Send email via the email Lambda
      const sendEmailResponse = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: driverEmail,
          emailSubject: subject,
          emailBody: body
        })
      });
      
      if (!sendEmailResponse.ok) {
        const sendEmailError = await sendEmailResponse.json();
        console.error("Failed to send alert email:", sendEmailError);
      } else {
        console.log("Alert email sent successfully to driver");
      }
    } catch (emailError) {
      console.error("Error sending driver alert email:", emailError);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter purchases by selected driver
  const filteredPurchases = activeDriverFilter === 'all' 
    ? purchaseRequests 
    : purchaseRequests.filter(purchase => purchase.driverId.toString() === activeDriverFilter);
  
  if (loading) {
    return <div className="text-center p-8">Loading purchase requests...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Driver Purchase Requests</h1>
        <p className="text-gray-600">
          Review and approve or deny driver purchase requests
        </p>
      </div>
      
      {/* Status Filter Tabs */}
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeFilter === 'Processing' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('Processing')}
          >
            Pending Requests
          </button>
          <button 
            className={`px-4 py-2 ${activeFilter === 'Approved' ? 'border-b-2 border-green-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('Approved')}
          >
            Approved
          </button>
          <button 
            className={`px-4 py-2 ${activeFilter === 'Denied' ? 'border-b-2 border-red-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('Denied')}
          >
            Denied
          </button>
          <button 
            className={`px-4 py-2 ${activeFilter === 'Cancelled' ? 'border-b-2 border-gray-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveFilter('Cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {/* Driver Filter */}
      {uniqueDrivers.length > 0 && (
        <div className="mb-6">
          <label htmlFor="driverFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Driver:
          </label>
          <select
            id="driverFilter"
            value={activeDriverFilter}
            onChange={(e) => setActiveDriverFilter(e.target.value)}
            className="p-2 border rounded-md w-full sm:w-auto"
          >
            <option value="all">All Drivers</option>
            {uniqueDrivers.map(driver => (
              <option key={driver.id} value={driver.id.toString()}>
                {driver.name} ({driver.email})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {filteredPurchases.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">No {activeFilter.toLowerCase()} purchase requests found</p>
          {activeFilter === 'Processing' && (
            <p>When drivers place orders, they will appear here for your approval.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPurchases.map(purchase => (
            <div 
              key={purchase.purchaseId} 
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {/* Purchase Header */}
              <div className="bg-gray-50 p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold">
                    Order #{purchase.purchaseId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(purchase.orderDate)}
                  </p>
                </div>
                
                <div className="flex flex-col sm:items-end">
                  <p className="text-sm">
                    <span className="font-medium">Driver:</span> {purchase.driverFirstName} {purchase.driverLastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {purchase.driverEmail}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">
                    {purchase.totalPoints.toLocaleString()} points
                  </p>
                  <p className="text-xs text-gray-500">
                    {purchase.itemCount} items
                  </p>
                </div>
              </div>
              
              {/* Purchase Actions */}
              <div className="p-4 flex flex-wrap justify-between items-center">
                <button
                  onClick={() => handleExpandOrder(purchase.purchaseId)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{expandedOrders[purchase.purchaseId] ? 'Hide' : 'View'} Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expandedOrders[purchase.purchaseId] ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeFilter === 'Processing' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDenyOrder(purchase.purchaseId)}
                      disabled={processingAction === purchase.purchaseId}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      {processingAction === purchase.purchaseId ? 'Processing...' : 'Deny'}
                    </button>
                    <button
                      onClick={() => handleApproveOrder(purchase.purchaseId)}
                      disabled={processingAction === purchase.purchaseId}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      {processingAction === purchase.purchaseId ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                )}
                
                {activeFilter !== 'Processing' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${activeFilter === 'Approved' ? 'bg-green-100 text-green-800' : 
                      activeFilter === 'Denied' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {activeFilter}
                  </span>
                )}
              </div>
              
              {/* Purchase Items */}
              {expandedOrders[purchase.purchaseId] && (
                <div className="p-4 border-t bg-gray-50">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price (Points)
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchase.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.pointPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.totalPointPrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-6 py-4 text-right font-semibold">
                            Total Points:
                          </td>
                          <td className="px-6 py-4 font-bold">
                            {purchase.totalPoints.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">About Purchase Approvals</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>When drivers place orders, they are initially in "Processing" status and await your approval.</li>
          <li>Approving an order will deduct points from the driver's balance and complete the purchase.</li>
          <li>Denying an order will cancel it without deducting any points from the driver.</li>
          <li>Drivers can cancel their own orders while they are in "Processing" status.</li>
        </ul>
      </div>
    </div>
  );
}