"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ReceiptPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);

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
    // In a real app, we'd fetch the receipt data from the server using the orderId
    // For this demo, we'll load it from localStorage where we stored it during checkout
    if (!authorized || !userId) return;
    try {
      const storedReceipt = localStorage.getItem('latestReceipt');
      if (storedReceipt) {
        setReceiptData(JSON.parse(storedReceipt));
      }
    } catch (err) {
      console.error("Error loading receipt data:", err);
    } finally {
      setLoading(false);
    }
  }, [authorized, userId, orderId]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      setCancelling(true);
      
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
      
      // Update local receipt data
      setReceiptData(prev => ({
        ...prev,
        status: 'Cancelled'
      }));
      
      // Update localStorage
      const storedReceipt = localStorage.getItem('latestReceipt');
      if (storedReceipt) {
        const parsedReceipt = JSON.parse(storedReceipt);
        parsedReceipt.status = 'Cancelled';
        localStorage.setItem('latestReceipt', JSON.stringify(parsedReceipt));
      }
      
      // Show success message
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setCancelling(false);
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
  
  if (loading) {
    return <div className="text-center p-8">Loading receipt...</div>;
  }
  
  if (!receiptData) {
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
        <h1 className="text-2xl font-bold mb-6">Receipt</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">Receipt information not found</p>
          <Link href="/pages/driver/sponsors" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Return to Sponsor Selection
          </Link>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const orderDate = new Date(receiptData.orderDate);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Group items by sponsor
  const groupedItems = {};
  
  receiptData.items.forEach(item => {
    const sponsorId = item.Sponsor_Org_ID;
    
    if (!groupedItems[sponsorId]) {
      groupedItems[sponsorId] = {
        sponsorId,
        sponsorName: item.Sponsor_Org_Name || `Sponsor ${sponsorId}`,
        items: [],
        totalPoints: 0
      };
    }
    
    groupedItems[sponsorId].items.push(item);
    groupedItems[sponsorId].totalPoints += item.pointPrice * item.quantity;
  });
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Print controls - won't be printed */}
      <div className="print:hidden mb-6 flex justify-between">
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
        <h1 className="text-2xl font-bold">Order Receipt</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Print Receipt
          </button>
          <Link href="/pages/driver/purchase-history" className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Purchase History
          </Link>
          <Link href="/pages/driver/sponsors" className="bg-green-500 text-white px-4 py-2 rounded-md">
            Continue Shopping
          </Link>
        </div>
      </div>
      
      {/* Receipt content - will be printed */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        {/* Status badge - prominent display */}
        <div className="mb-6 flex justify-center">
          <span className={`px-4 py-2 inline-flex text-base leading-5 font-bold rounded-full ${getStatusBadgeClass(receiptData.status || 'Processing')}`}>
            Status: {receiptData.status || 'Processing'}
          </span>
        </div>
        
        {/* Order information */}
        <div className="mb-6 flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="font-semibold text-gray-700">Order Information</h2>
            <p><span className="font-medium">Order ID{receiptData.orderIds?.length > 1 ? 's' : ''}:</span> {receiptData.orderIds?.map(id => `#${id}`).join(', ') || `#${receiptData.orderId}`}</p>
            <p><span className="font-medium">Date:</span> {formattedDate}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <h2 className="font-semibold text-gray-700">Payment</h2>
            <p><span className="font-medium">Payment Method:</span> Points Redemption</p>
            <p><span className="font-medium">Total Points:</span> {receiptData.totalPoints.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Cancel button for Processing orders */}
        {(receiptData.status === 'Processing' || !receiptData.status) && (
          <div className="mb-6 print:hidden">
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
            <p className="text-sm text-gray-500 mt-1 text-center">
              You can cancel this order while it's still in processing status. Once approved, cancellation is not possible.
            </p>
          </div>
        )}
        
        {receiptData.status === 'Denied' && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-700 font-medium">This order has been denied by your sponsor.</p>
            <p className="text-sm text-gray-600">
              Your points were not deducted. Please contact your sponsor for more information.
            </p>
          </div>
        )}
        
        {receiptData.status === 'Cancelled' && (
          <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <p className="text-gray-700 font-medium">This order has been cancelled.</p>
            <p className="text-sm text-gray-600">
              Your points were not deducted. You can place a new order at any time.
            </p>
          </div>
        )}
        
        {receiptData.status === 'Approved' && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-green-700 font-medium">This order has been approved!</p>
            <p className="text-sm text-gray-600">
              {receiptData.totalPoints.toLocaleString()} points have been deducted from your account.
            </p>
          </div>
        )}
        
        {/* Order items by sponsor */}
        {Object.values(groupedItems).map(sponsor => (
          <div key={sponsor.sponsorId} className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-2">{sponsor.sponsorName} Items</h2>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (points)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sponsor.items.map((item) => (
                  <tr key={`${sponsor.sponsorId}-${item.Product_ID}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.Product_Name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.pointPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(item.pointPrice * item.quantity).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 text-right font-semibold">
                    Sponsor Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {sponsor.totalPoints.toLocaleString()} points
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
        
        {/* Overall total */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-end">
            <div className="text-lg font-bold">
              Total: {receiptData.totalPoints.toLocaleString()} points
            </div>
          </div>
        </div>
        
        {/* Receipt footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>Thank you for your order!</p>
          {(receiptData.status === 'Processing' || !receiptData.status) && (
            <p>Your order is currently being reviewed by your sponsor for approval.</p>
          )}
          <p className="mt-2">&copy; {new Date().getFullYear()} Good Driver Program</p>
        </div>
      </div>
    </div>
  );
}

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReceiptPage />
    </Suspense>
  );
}