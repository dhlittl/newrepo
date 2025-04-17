"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { userId, isAssumed } = useEffectiveDriverId();
  const [authorized, setAuthorized] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // For testing purposes - in production, this would come from authentication
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
    // Load cart items from localStorage
    const storedCart = localStorage.getItem('driverCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      } catch (err) {
        console.error("Error parsing cart from localStorage:", err);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    
    // Fetch driver info (points balance)
    fetchDriverInfo();
    
    setLoading(false);
  }, [authorized, userId]);
  
  // Calculate total points whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.pointPrice * item.quantity);
    }, 0);
    
    setTotalPoints(total);
  }, [cartItems]);
  
  // Fetch driver information (points balance)
  const fetchDriverInfo = async () => {
    try {
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Driver/Dashboard/Points`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch driver info: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDriverInfo({
        pointBalance: data.points || 0
      });
    } catch (err) {
      console.error("Error fetching driver info:", err);
      // Set default points for testing
      setDriverInfo({
        pointBalance: 5000
      });
    }
  };
  
  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    const updatedCart = cartItems.map(item => {
      if (item.Product_ID === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('driverCart', JSON.stringify(updatedCart));
  };
  
  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.Product_ID !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('driverCart', JSON.stringify(updatedCart));
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('driverCart');
  };
  
  // Modified handleCheckout function for page.jsx (cart page)
  const handleCheckout = async () => {
    // Check if user has enough points
    if (!driverInfo || totalPoints > driverInfo.pointBalance) {
      alert("You don't have enough points for this purchase!");
      return;
    }
    
    // Check if any items are out of stock or quantity issues
    const stockIssue = cartItems.some(item => item.quantity > item.Quantity);
    if (stockIssue) {
      alert("Some items in your cart have availability issues. Please review your cart.");
      return;
    }
    
    try {
      // Prepare order data - using proper field names for Lambda
      const orderData = {
        driverId: userId, 
        userId: userId,   
        items: cartItems.map(item => ({
          productId: item.Product_ID,
          quantity: item.quantity,
          pointPrice: item.pointPrice
        })),
        totalPoints: totalPoints,
        orderDate: new Date().toISOString()
      };
      
      console.log("Sending order data:", JSON.stringify(orderData));
      
      // Make the API call to place the order
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Driver/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      // Parse the API response
      const responseData = await response.json();
      console.log("Order API response:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to place order");
      }
      
      // Use the actual orderId from the response, or fallback to random if not available
      const orderId = responseData.orderId || Math.floor(Math.random() * 1000000);
      
      // Store receipt data in localStorage for the receipt page
      const receiptData = {
        orderId: orderId,
        orderDate: new Date().toISOString(),
        items: cartItems,
        totalPoints: totalPoints
      };
      localStorage.setItem('latestReceipt', JSON.stringify(receiptData));
      
      // Send confirmation email
      try {
        // We have userId from useEffectiveDriverId hook
        // Fetch the user's email using the new Lambda endpoint
        console.log("Fetching email for user ID:", userId);
        
        const emailResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Team24-GetUserEmail?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!emailResponse.ok) {
          console.error("Failed to retrieve user email, status:", emailResponse.status);
          throw new Error("Failed to retrieve user email");
        }
        
        const emailData = await emailResponse.json();
        const userEmail = emailData.email;
        
        if (!userEmail) {
          console.error("No email found for user ID:", userId);
          throw new Error("No email found for user");
        }
        
        console.log("Sending confirmation email to:", userEmail);
        
        // Create email content with order details
        const emailSubject = `Your Order Confirmation #${orderId}`;
        
        let emailBody = `
          <html>
            <body>
              <h2>Thank you for your order!</h2>
              <p>Order #${orderId} has been successfully placed.</p>
              <p>Date: ${new Date().toLocaleString()}</p>
              <p>Total Points: ${totalPoints}</p>
              
              <h3>Order Details:</h3>
              <table border="1" cellpadding="5">
                <tr>
                  <th>Item</th>
                  <th>Price (Points)</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
        `;
        
        cartItems.forEach(item => {
          emailBody += `
            <tr>
              <td>${item.Product_Name}</td>
              <td>${item.pointPrice}</td>
              <td>${item.quantity}</td>
              <td>${item.pointPrice * item.quantity}</td>
            </tr>
          `;
        });
        
        emailBody += `
              </table>
              <p>Thank you for participating in the Good Driver Program!</p>
            </body>
          </html>
        `;
        
        // Send email via our email Lambda
        const sendEmailResponse = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientEmail: userEmail,
            emailSubject: emailSubject,
            emailBody: emailBody
          })
      });
      
      if (!sendEmailResponse.ok) {
        const sendEmailError = await sendEmailResponse.json();
        console.error("Failed to send confirmation email:", sendEmailError);
      } else {
        console.log("Confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("Error in email process:", emailError);
      // Email error shouldn't block the checkout process
    }      
      
      // Clear the cart after successful checkout
      clearCart();
      
      // Redirect to receipt page
      router.push(`/pages/driver/receipt?orderId=${orderId}`);
      
    } catch (err) {
      console.error("Error during checkout:", err);
      alert(`There was an error processing your order: ${err.message}`);
      
      // Don't proceed with checkout on error
      return;
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading cart...</div>;
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
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
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Link href="/pages/driver/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
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
      
      {driverInfo && (
        <div className="bg-blue-100 p-3 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <span className="font-semibold">Your Points Balance: </span>
            <span className="text-lg font-bold text-blue-700">{driverInfo.pointBalance.toLocaleString()} points</span>
          </div>
          
          <div>
            <span className="font-semibold">Cart Total: </span>
            <span className={`text-lg font-bold ${totalPoints > driverInfo.pointBalance ? 'text-red-600' : 'text-green-600'}`}>
              {totalPoints.toLocaleString()} points
            </span>
            
            {totalPoints > driverInfo.pointBalance && (
              <p className="text-red-600 text-xs mt-1">
                You need {(totalPoints - driverInfo.pointBalance).toLocaleString()} more points to complete this purchase
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cartItems.map((item) => (
              <tr key={item.Product_ID}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {item.Image_URL ? (
                        <img className="h-10 w-10 object-cover" src={item.Image_URL} alt={item.Product_Name} />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.Product_Name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.pointPrice.toLocaleString()} points</div>
                  <div className="text-xs text-gray-500">(${parseFloat(item.Price).toFixed(2)} value)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button 
                      className="px-2 py-1 border rounded-md"
                      onClick={() => updateItemQuantity(item.Product_ID, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                      className="px-2 py-1 border rounded-md"
                      onClick={() => updateItemQuantity(item.Product_ID, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(item.pointPrice * item.quantity).toLocaleString()} points
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => removeFromCart(item.Product_ID)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan="3" className="px-6 py-4 text-right font-semibold">
                Total:
              </td>
              <td className="px-6 py-4 font-bold text-lg">
                {totalPoints.toLocaleString()} points
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="flex justify-between">
        <div>
          <button
            onClick={clearCart}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Clear Cart
          </button>
          <Link href="/pages/driver/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Continue Shopping
          </Link>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={totalPoints > (driverInfo?.pointBalance || 0)}
          className={`px-6 py-2 rounded-md ${
            totalPoints > (driverInfo?.pointBalance || 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-semibold`}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}