"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'processing', 'approved', 'cancelled'
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    const checkGroup = async () => {
      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];

        if (groups.includes("driver") || groups.includes("sponsor") || groups.includes("admin")) {
          setAuthorized(true);
        } else {
          router.replace("/unauthorized");
        }
      } catch (err) {
        console.error("Auth error:", err);
        router.replace("/login");
      }
    };
    checkGroup();
  }, [router]);
  
  useEffect(() => {
    if (!authorized || !userId) return;
    fetchOrderHistory();
  }, [authorized, userId, activeTab]);
  
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      
      // Build the API URL
      let apiUrl = `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders?driverId=${userId}`;
      
      // Add status filter if not 'all'
      if (activeTab !== 'all') {
        const statusMap = {
          'processing': 'Processing',
          'approved': 'Approved',
          'denied': 'Denied',
          'cancelled': 'Cancelled'
        };
        apiUrl += `&status=${statusMap[activeTab]}`;
      }
      
      // Fetch orders from the API
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.orders && Array.isArray(data.orders)) {
        console.log("Fetched orders:", data.orders);
        setOrders(data.orders);
      } else {
        console.error("Invalid order data format:", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
      
      // Check localStorage for at least our most recent purchase
      const latestReceipt = localStorage.getItem('latestReceipt');
      const ordersList = [];
      
      if (latestReceipt) {
        try {
          const latestOrder = JSON.parse(latestReceipt);
          latestOrder.status = latestOrder.status || 'Processing'; // Default to Processing if not set
          ordersList.push(latestOrder);
        } catch (err) {
          console.error("Error parsing latest receipt:", err);
        }
      }
      
      setOrders(ordersList);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelOrder = async (orderId) => {
    try {
      setCancellingOrder(orderId);
      
      // Call the API to cancel the order
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseId: orderId,
          status: 'Cancelled',
          userId: userId,
          isSponsor: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel order');
      }
      
      // Refresh the order list after successful cancellation
      await fetchOrderHistory();
      
      // Show success message
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setCancellingOrder(null);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const viewReceipt = (order) => {
    // Store the order in localStorage so the receipt page can access it
    localStorage.setItem('latestReceipt', JSON.stringify(order));
    // Navigate to the receipt page with the correct path
    router.push(`/pages/driver/receipt?orderId=${order.orderId}`);
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading purchase history...</div>;
  }
  
  // Filter orders based on active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => {
        if (activeTab === 'processing') return order.status === 'Processing';
        if (activeTab === 'approved') return order.status === 'Approved';
        if (activeTab === 'denied') return order.status === 'Denied';
        if (activeTab === 'cancelled') return order.status === 'Cancelled';
        return true;
      });
  
  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4">
        {/* Return button for sponsors */}
        {isAssumed && (
          <button
          className="mb-4 text-sm text-gray-700 underline"
          onClick={() => {
              sessionStorage.removeItem("assumedDriverId");
              sessionStorage.removeItem("assumedDriverName");
              router.push("/pages/sponsor/drivers");
          }}
          >
          ← Return to Sponsor View
          </button>
        )}
        <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">You haven't made any purchases yet</p>
          <Link href="/pages/driver/sponsors" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse Catalogs
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* Return button for sponsors */}
      {isAssumed && (
          <button
          className="mb-4 text-sm text-gray-700 underline"
          onClick={() => {
              sessionStorage.removeItem("assumedDriverId");
              sessionStorage.removeItem("assumedDriverName");
              router.push("/pages/sponsor/drivers");
          }}
          >
          ← Return to Sponsor View
          </button>
      )}
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
      
      {/* Status tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'processing' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('processing')}
        >
          Processing
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'denied' ? 'border-b-2 border-border-red-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('denied')}
        >
          Denied
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'cancelled' ? 'border-b-2 border-gray-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      <div className="mb-6">
        <Link href="/pages/driver/sponsors" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Continue Shopping
        </Link>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">No orders found with the selected status</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                // Format date for display
                const orderDate = new Date(order.orderDate);
                const formattedDate = orderDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <tr key={order.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formattedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.totalPoints?.toLocaleString() || 0} points</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.sponsorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                      <button
                        onClick={() => viewReceipt(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      
                      {/* Only show cancel button for Processing orders */}
                      {order.status === 'Processing' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              cancelOrder(order.orderId);
                            }
                          }}
                          disabled={cancellingOrder === order.orderId}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {cancellingOrder === order.orderId ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Order Status Explanation</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li><span className="text-blue-800 font-semibold">Processing</span> - Your order has been received and is waiting for sponsor approval</li>
          <li><span className="text-green-800 font-semibold">Approved</span> - Your order has been approved by your sponsor and points have been deducted</li>
          <li><span className="text-red-800 font-semibold">Denied</span> - Your order has been denied by your sponsor</li>
          <li><span className="text-gray-800 font-semibold">Cancelled</span> - You have cancelled this order</li>
        </ul>
      </div>
    </div>
  );
}