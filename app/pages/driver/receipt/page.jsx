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
    if (!authorized || !userId) return;
    
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // Try to get complete order details from API first
        if (orderId) {
          console.log("Fetching order details from API for orderId:", orderId);
          const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders?driverId=${userId}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log("API response for driver orders:", data);
            
            // Find the specific order in the returned orders array
            if (data && data.orders && Array.isArray(data.orders)) {
              const orderData = data.orders.find(o => o.purchaseId === orderId || o.orderId === orderId);
              
              if (orderData) {
                console.log("Found matching order:", orderData);
                
                // Check if orderData has items - if not, we need to get those separately
                if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                  // We need to fetch order items separately
                  console.log("Fetching order items for purchase ID:", orderId);
                  try {
                    const itemsResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders/items?purchaseId=${orderId}`);
                    
                    if (itemsResponse.ok) {
                      const itemsData = await itemsResponse.json();
                      console.log("Items data:", itemsData);
                      
                      if (itemsData && itemsData.items) {
                        orderData.items = itemsData.items;
                      }
                    }
                  } catch (itemsErr) {
                    console.error("Failed to fetch order items:", itemsErr);
                  }
                }
                
                // Transform the API data to match the expected receipt format
                const formattedOrder = {
                  orderIds: [orderData.purchaseId || orderData.orderId || orderId],
                  orderId: orderData.purchaseId || orderData.orderId || orderId,
                  orderDate: orderData.purchaseDate || orderData.orderDate || new Date().toISOString(),
                  status: orderData.status || 'Processing',
                  totalPoints: orderData.totalPoints || 0,
                  items: orderData.items || [],
                  sponsorName: orderData.sponsorName || "Unknown Sponsor"
                };
                
                setReceiptData(formattedOrder);
                localStorage.setItem('latestReceipt', JSON.stringify(formattedOrder));
                setLoading(false);
                return;
              }
            }
          }
        }
        
        // If API didn't return the specific order, check localStorage as fallback
        const storedReceipt = localStorage.getItem('latestReceipt');
        if (storedReceipt) {
          console.log("Using stored receipt data from localStorage");
          const localData = JSON.parse(storedReceipt);
          setReceiptData(localData);
        } else {
          console.error("Could not find receipt data from any source");
          // Try one more API endpoint as a last resort
          try {
            const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders?purchaseId=${orderId}&driverId=${userId}`);
            
            if (response.ok) {
              const data = await response.json();
              console.log("Last resort API response:", data);
              
              if (data && data.order) {
                const lastResortData = {
                  orderIds: [data.order.purchaseId || orderId],
                  orderId: data.order.purchaseId || orderId,
                  orderDate: data.order.purchaseDate || new Date().toISOString(),
                  status: data.order.status || 'Processing',
                  totalPoints: data.order.totalPoints || 0,
                  items: data.order.items || [],
                  sponsorName: data.order.sponsorName || "Unknown Sponsor"
                };
                setReceiptData(lastResortData);
              }
            }
          } catch (lastErr) {
            console.error("Last resort API failed too:", lastErr);
          }
        }
      } catch (err) {
        console.error("Error loading receipt data:", err);
        // If everything else fails, still try localStorage
        try {
          const storedReceipt = localStorage.getItem('latestReceipt');
          if (storedReceipt) {
            setReceiptData(JSON.parse(storedReceipt));
          }
        } catch (localErr) {
          console.error("Failed to load from localStorage as well:", localErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
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
  const orderDate = new Date(receiptData.orderDate || new Date());
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Log the complete receipt data structure to debug
  console.log("Receipt data structure:", JSON.stringify(receiptData, null, 2));
  
  // Safe access of items array with comprehensive fallbacks
  let items = [];
  
  // Check multiple possible item array locations in the data structure
  if (Array.isArray(receiptData.items) && receiptData.items.length > 0) {
    items = receiptData.items;
  } else if (receiptData.order && Array.isArray(receiptData.order.items)) {
    items = receiptData.order.items;
  } else if (receiptData.data && Array.isArray(receiptData.data.items)) {
    items = receiptData.data.items; 
  } else if (receiptData.data && receiptData.data.order && Array.isArray(receiptData.data.order.items)) {
    items = receiptData.data.order.items;
  } else if (Array.isArray(receiptData.orderItems)) {
    items = receiptData.orderItems;
  } else if (receiptData.purchaseItems && Array.isArray(receiptData.purchaseItems)) {
    items = receiptData.purchaseItems;
  }
  
  // If we still don't have items but we have purchase details, reconstruct an item
  if (items.length === 0 && receiptData.totalPoints) {
    console.log("Reconstructing items from receipt data");
    items = [{
      Product_ID: 'reconstructed-item',
      Product_Name: 'Purchased Item',
      pointPrice: receiptData.totalPoints,
      quantity: 1,
      Sponsor_Org_ID: receiptData.sponsorId || 'unknown',
      Sponsor_Org_Name: receiptData.sponsorName || 'Sponsor'
    }];
  }
  
  console.log("Final items array:", items);
  
  // Group items by sponsor with proper fallbacks and consistent key naming
  const groupedItems = {};

  items.forEach((item, index) => {
    // Log the item format to understand its structure
    console.log(`Item ${index} format:`, item);
    
    // Check for different case variations of property names to handle API inconsistencies
    const productId = item.Product_ID || item.productId || item.product_id || `item-${index}`;
    const productName = item.Product_Name || item.productName || item.product_name || `Item #${index + 1}`;
    
    // Handle point price with multiple fallbacks
    let pointPrice = 0;
    if (typeof item.pointPrice === 'number') {
      pointPrice = item.pointPrice;
    } else if (typeof item.point_price === 'number') {
      pointPrice = item.point_price;
    } else if (typeof item.Point_Price === 'number') {
      pointPrice = item.Point_Price;
    } else if (typeof item.price === 'number') {
      pointPrice = item.price;
    } else if (typeof item.Price === 'number') {
      pointPrice = item.Price;
    }
    
    // Handle quantity with fallbacks
    const quantity = item.quantity || item.Quantity || 1;
    
    // IMPORTANT FIX: Use a consistent key for grouping items
    // Create a normalized sponsorId that's consistent across all items
    let sponsorId = null;
    
    if (item.Sponsor_Org_ID) {
      sponsorId = String(item.Sponsor_Org_ID);
    } else if (item.sponsorId) {
      sponsorId = String(item.sponsorId);
    } else if (item.sponsor_id) {
      sponsorId = String(item.sponsor_id);
    } else if (item.SponsorId) {
      sponsorId = String(item.SponsorId);
    } else if (item.sponsorOrgId) {
      sponsorId = String(item.sponsorOrgId);
    } else if (receiptData.sponsorId) {
      sponsorId = String(receiptData.sponsorId);
    } else {
      // If no sponsor ID can be found, use the sponsorName as the key
      sponsorId = item.Sponsor_Org_Name || item.sponsorName || item.sponsor_name || 
                receiptData.sponsorName || "unknown";
    }
    
    const sponsorName = item.Sponsor_Org_Name || item.sponsorName || item.sponsor_name || 
                      receiptData.sponsorName || `Sponsor ${sponsorId}`;
    
    // Create the sponsor group if it doesn't exist
    if (!groupedItems[sponsorId]) {
      groupedItems[sponsorId] = {
        sponsorId: sponsorId,
        sponsorName: sponsorName,
        items: [],
        totalPoints: 0
      };
    }
    
    // Ensure the item has all expected properties
    const safeItem = {
      Product_ID: productId,
      Product_Name: productName,
      pointPrice: pointPrice,
      quantity: quantity,
      Sponsor_Org_ID: sponsorId,
      Sponsor_Org_Name: sponsorName
    };
    
    groupedItems[sponsorId].items.push(safeItem);
    groupedItems[sponsorId].totalPoints += (safeItem.pointPrice * safeItem.quantity);
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
            <p>
              <span className="font-medium">
                Order ID{Array.isArray(receiptData.orderIds) && receiptData.orderIds.length > 1 ? 's' : ''}:
              </span> 
              {Array.isArray(receiptData.orderIds) 
                ? receiptData.orderIds.map(id => `#${id}`).join(', ') 
                : `#${receiptData.orderId || orderId}`}
            </p>
            <p><span className="font-medium">Date:</span> {formattedDate}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <h2 className="font-semibold text-gray-700">Payment</h2>
            <p><span className="font-medium">Payment Method:</span> Points Redemption</p>
            <p>
              <span className="font-medium">Total Points:</span> 
              {(receiptData.totalPoints || Object.values(groupedItems).reduce((sum, s) => sum + s.totalPoints, 0)).toLocaleString()}
            </p>
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
              {(receiptData.totalPoints || Object.values(groupedItems).reduce((sum, s) => sum + s.totalPoints, 0)).toLocaleString()} points have been deducted from your account.
            </p>
          </div>
        )}
        
        {/* Display a message when there are no items but we have receipt data */}
        {Object.keys(groupedItems).length === 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-700 font-medium">Order details are not fully available</p>
            <p className="text-sm text-gray-600">
              Some information about this order may be missing or incomplete.
            </p>
          </div>
        )}
        
        {/* Order items by sponsor */}
        {Object.values(groupedItems).map((sponsor, sponsorIndex) => (
          <div key={`sponsor-${sponsor.sponsorId || sponsorIndex}`} className="mb-6">
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
                {sponsor.items.map((item, itemIndex) => (
                  <tr key={`item-${sponsor.sponsorId}-${item.Product_ID || itemIndex}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.Product_Name || `Item #${itemIndex + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(item.pointPrice || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity || 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{((item.pointPrice || 0) * (item.quantity || 1)).toLocaleString()}</div>
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
              Total: {(receiptData.totalPoints || 
                Object.values(groupedItems).reduce((sum, s) => sum + s.totalPoints, 0)
              ).toLocaleString()} points
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