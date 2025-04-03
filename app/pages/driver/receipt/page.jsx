"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we'd fetch the receipt data from the server using the orderId
    // For this demo, we'll load it from localStorage where we stored it during checkout
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
  }, [orderId]);
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading receipt...</div>;
  }
  
  if (!receiptData) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Receipt</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">Receipt information not found</p>
          <Link href="/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Return to Catalog
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
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Print controls - won't be printed */}
      <div className="print:hidden mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Order Receipt</h1>
        <div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Print Receipt
          </button>
          <Link href="/pages/driver/catalog" className="bg-green-500 text-white px-4 py-2 rounded-md">
            Continue Shopping
          </Link>
        </div>
      </div>
      
      {/* Receipt content - will be printed */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
        {/* Receipt header with logo and info */}
        <div className="text-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Good Driver Program</h1>
          <p className="text-gray-500">Order Receipt</p>
        </div>
        
        {/* Order information */}
        <div className="mb-6 flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="font-semibold text-gray-700">Order Information</h2>
            <p><span className="font-medium">Order ID:</span> #{receiptData.orderId}</p>
            <p><span className="font-medium">Date:</span> {formattedDate}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <h2 className="font-semibold text-gray-700">Payment</h2>
            <p><span className="font-medium">Payment Method:</span> Points Redemption</p>
            <p><span className="font-medium">Total Points Used:</span> {receiptData.totalPoints.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Order items */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Order Items</h2>
          <table className="min-w-full divide-y divide-gray-200">
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
              {receiptData.items.map((item) => (
                <tr key={item.Product_ID}>
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
                  Total:
                </td>
                <td className="px-6 py-4 font-bold">
                  {receiptData.totalPoints.toLocaleString()} points
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Receipt footer */}
        <div className="text-center text-gray-500 text-sm border-t pt-4">
          <p>Thank you for your order!</p>
          <p>If you have any questions about your order, please contact your sponsor.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Good Driver Program</p>
        </div>
      </div>
    </div>
  );
}