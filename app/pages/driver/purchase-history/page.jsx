"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(1); // For testing
  
  useEffect(() => {
    // In a real app, we'd fetch the order history from the backend
    // For example:
    // const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Driver/orders?driverId=${userId}`);
    // const data = await response.json();
    // setOrders(data.orders);
    
    // Check localStorage for our most recent purchase
    const latestReceipt = localStorage.getItem('latestReceipt');
    let latestOrder = null;
    
    if (latestReceipt) {
      try {
        latestOrder = JSON.parse(latestReceipt);
      } catch (err) {
        console.error("Error parsing latest receipt:", err);
      }
    }
    
    // Generate some sample order history data
    const sampleOrders = [
      {
        orderId: "ORD-" + Math.floor(Math.random() * 10000),
        orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 2500,
        status: 'Delivered',
        items: [
          {
            Product_ID: 101,
            Product_Name: "Wireless Headphones",
            pointPrice: 2500,
            quantity: 1
          }
        ]
      },
      {
        orderId: "ORD-" + Math.floor(Math.random() * 10000),
        orderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 1800,
        status: 'Delivered',
        items: [
          {
            Product_ID: 102,
            Product_Name: "Gift Card",
            pointPrice: 1800,
            quantity: 1
          }
        ]
      }
    ];
    
    // If we have a latest order, add it to the beginning of the list
    if (latestOrder) {
      latestOrder.status = 'Processing';
      sampleOrders.unshift(latestOrder);
    }
    
    setOrders(sampleOrders);
    setLoading(false);
  }, []);
  
  const viewReceipt = (order) => {
    // Store the order in localStorage so the receipt page can access it
    localStorage.setItem('latestReceipt', JSON.stringify(order));
    // Navigate to the receipt page with the correct path
    router.push(`/pages/driver/receipt?orderId=${order.orderId}`);
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading purchase history...</div>;
  }
  
  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">You haven't made any purchases yet</p>
          <Link href="/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
      
      <div className="mb-6">
        <Link href="/pages/driver/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Continue Shopping
        </Link>
      </div>
      
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
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => {
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
                    <div className="text-sm text-gray-900">{order.totalPoints.toLocaleString()} points</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewReceipt(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Order Status Explanation</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          <li><span className="text-blue-800 font-semibold">Processing</span> - Your order has been received and is being processed</li>
          <li><span className="text-yellow-800 font-semibold">Shipped</span> - Your order has been shipped and is on its way</li>
          <li><span className="text-green-800 font-semibold">Delivered</span> - Your order has been delivered</li>
        </ul>
      </div>
    </div>
  );
}