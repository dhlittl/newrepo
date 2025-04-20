"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function CombinedReceiptPage() {
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    if (!authorized || !userId) return;
    
    const loadCombinedReceipt = () => {
      setLoading(true);
      try {
        // Get combined receipt from localStorage
        const storedReceipt = localStorage.getItem('combinedReceipt');
        
        if (storedReceipt) {
          const parsedReceipt = JSON.parse(storedReceipt);
          console.log("Loaded combined receipt:", parsedReceipt);
          setReceiptData(parsedReceipt);
          
          // Clear the combinedReceipt from localStorage so it only shows once
          // But keep the latestReceipt for individual receipt pages
          localStorage.removeItem('combinedReceipt');
        } else {
          // If no combined receipt found, redirect to purchase history
          console.log("No combined receipt found, redirecting to purchase history");
          router.replace('/pages/driver/purchase-history');
        }
      } catch (err) {
        console.error("Error loading combined receipt data:", err);
        router.replace('/pages/driver/purchase-history');
      } finally {
        setLoading(false);
      }
    };
    
    loadCombinedReceipt();
  }, [authorized, userId, router]);
  
  const handlePrint = () => {
    window.print();
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
    return <div className="text-center p-8">Loading receipt summary...</div>;
  }
  
  if (!receiptData || !receiptData.orders || !Array.isArray(receiptData.orders) || receiptData.orders.length === 0) {
    return (
      <div className="container mx-auto p-4">
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
        <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">No order information available</p>
          <Link href="/pages/driver/purchase-history" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            View Purchase History
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate the total points across all orders
  const totalOrderPoints = receiptData.totalPoints || 
    receiptData.orders.reduce((sum, order) => sum + (order.totalPoints || 0), 0);
  
  // Format date for display
  const orderDate = new Date(receiptData.orderDate || new Date());
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Print controls - won't be printed */}
      <div className="print:hidden mb-6 flex justify-between">
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
        <h1 className="text-2xl font-bold">Order Summary</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Print
          </button>
          <Link href="/pages/driver/purchase-history" className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Purchase History
          </Link>
          <Link href="/pages/driver/sponsors" className="bg-green-500 text-white px-4 py-2 rounded-md">
            Continue Shopping
          </Link>
        </div>
      </div>
      
      {/* Multi-sponsor receipt content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        {/* Top banner with success message */}
        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-bold text-green-700">Orders Placed Successfully!</h2>
          </div>
          <p className="text-gray-600">
            You have successfully placed {receiptData.orders.length} {receiptData.orders.length === 1 ? 'order' : 'orders'} on {formattedDate}
          </p>
        </div>
        
        {/* Order summary information */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-700">Order Summary</h2>
          <p className="text-gray-600">
            Total Value: <span className="font-bold">{totalOrderPoints.toLocaleString()} points</span>
          </p>
        </div>
        
        {/* Order Processing Notice */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="font-medium text-yellow-800">Important: All orders are currently processing</p>
          <p className="text-sm text-gray-600">
            Your orders are awaiting sponsor approval. Points will not be deducted until orders are approved.
            You can view individual order details or cancel pending orders from your purchase history.
          </p>
        </div>
        
        {/* Orders summary */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Orders Overview</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptData.orders.map((order, index) => (
                <tr key={order.orderId || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.sponsorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(order.items) ? order.items.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(order.totalPoints || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      href={`/pages/driver/receipt?orderId=${order.orderId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-right font-semibold">
                  Grand Total:
                </td>
                <td colSpan="2" className="px-6 py-4 font-bold">
                  {totalOrderPoints.toLocaleString()} points
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Order details for each sponsor */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receiptData.orders.map((order, orderIndex) => (
              <div key={`order-${order.orderId || orderIndex}`} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">
                  {order.sponsorName}
                </h4>
                <p className="text-gray-500 text-sm mb-2">Order #{order.orderId}</p>
                
                <div className="mb-3">
                  <div className="bg-gray-50 p-2 rounded-md">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="float-right font-bold">{(order.totalPoints || 0).toLocaleString()} points</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  {Array.isArray(order.items) && order.items.map((item, itemIndex) => {
                    // Check for different property naming patterns
                    const productName = item.Product_Name || item.productName || item.product_name || `Item #${itemIndex + 1}`;
                    const pointPrice = item.pointPrice || item.Point_Price || item.price || 0;
                    const quantity = item.quantity || item.Quantity || 1;
                    
                    return (
                      <div key={`item-${orderIndex}-${itemIndex}`} className="text-sm border-b border-gray-100 pb-1">
                        <div className="flex justify-between">
                          <span>{productName}</span>
                          <span>{(pointPrice * quantity).toLocaleString()} pts</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {quantity} x {pointPrice.toLocaleString()} points
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!Array.isArray(order.items) || order.items.length === 0) && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      Item details not available
                    </div>
                  )}
                </div>
                
                <div className="text-right mt-3">
                  <Link
                    href={`/pages/driver/receipt?orderId=${order.orderId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Full Receipt →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mb-6 flex justify-center space-x-4">
          <Link
            href="/pages/driver/purchase-history"
            className="bg-blue-500 text-white px-6 py-2 rounded-md"
          >
            Go to Purchase History
          </Link>
        </div>
        
        {/* Receipt footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>Thank you for your orders!</p>
          <p>All orders are currently being reviewed by your sponsors for approval.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Good Driver Program</p>
        </div>
      </div>
    </div>
  );
}

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CombinedReceiptPage />
    </Suspense>
  );
}