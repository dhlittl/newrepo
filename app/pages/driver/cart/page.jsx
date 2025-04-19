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
  const [sponsorPointBalances, setSponsorPointBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [groupedCartItems, setGroupedCartItems] = useState({});
  const [totalPointsBySponsors, setTotalPointsBySponsors] = useState({});
  
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
  
  // Group cart items by sponsor
  useEffect(() => {
    const grouped = {};
    const totalsBySponsors = {};
    
    cartItems.forEach(item => {
      const sponsorId = item.Sponsor_Org_ID;
      
      if (!grouped[sponsorId]) {
        grouped[sponsorId] = {
          sponsorId,
          sponsorName: item.Sponsor_Org_Name || `Sponsor ${sponsorId}`,
          items: []
        };
        totalsBySponsors[sponsorId] = 0;
      }
      
      grouped[sponsorId].items.push(item);
      totalsBySponsors[sponsorId] += item.pointPrice * item.quantity;
    });
    
    setGroupedCartItems(grouped);
    setTotalPointsBySponsors(totalsBySponsors);
    
    // Calculate overall total points
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.pointPrice * item.quantity);
    }, 0);
    
    setTotalPoints(total);
  }, [cartItems]);
  
  const fetchDriverInfo = async () => {
    try {
      // Get all points for this driver
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/Dashboard/Points?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch driver info: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create a map of sponsor ID to point balance
      const pointBalances = {};
      data.forEach(sponsor => {
        pointBalances[sponsor.Sponsor_Org_ID] = sponsor.Point_Balance;
      });
      
      setSponsorPointBalances(pointBalances);
    } catch (err) {
      console.error("Error fetching driver info:", err);
      setSponsorPointBalances({});
    }
  };

  const updateItemQuantity = (productId, sponsorId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    const updatedCart = cartItems.map(item => {
      if (item.Product_ID === productId && item.Sponsor_Org_ID === sponsorId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('driverCart', JSON.stringify(updatedCart));
  };
  
  const removeFromCart = (productId, sponsorId) => {
    const updatedCart = cartItems.filter(item => 
      !(item.Product_ID === productId && item.Sponsor_Org_ID === sponsorId)
    );
    setCartItems(updatedCart);
    localStorage.setItem('driverCart', JSON.stringify(updatedCart));
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('driverCart');
  };
  
  // Send alert email 
  const sendAlertEmail = async (subject, body) => {
    try {
      // Get user email
      console.log("Fetching email for user ID:", userId);
      
      const emailResponse = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-GetUserEmail?userId=${userId}`, {
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
      
      console.log("Sending alert email to:", userEmail);
      
      // Send email via our email Lambda
      const sendEmailResponse = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: userEmail,
          emailSubject: subject,
          emailBody: body
        })
      });
      
      if (!sendEmailResponse.ok) {
        const sendEmailError = await sendEmailResponse.json();
        console.error("Failed to send alert email:", sendEmailError);
      } else {
        console.log("Alert email sent successfully");
      }
    } catch (emailError) {
      console.error("Error in email process:", emailError);
    }
  };

  // Modified handleCheckout function with purchase approval flow
  const handleCheckout = async () => {
    // Check for stock issues
    const stockIssues = cartItems.filter(item => item.quantity > item.Quantity);
    if (stockIssues.length > 0) {
      // Create and send stock issues alert email
      const emailSubject = `Order Alert: Item(s) Out of Stock`;
      
      let emailBody = `
        <html>
          <body>
            <h2>Order Alert: Stock Issues</h2>
            <p>Your order could not be processed because one or more items have availability issues:</p>
            <table border="1" cellpadding="5">
              <tr>
                <th>Sponsor</th>
                <th>Item</th>
                <th>Requested Quantity</th>
                <th>Available Quantity</th>
              </tr>
      `;
      
      // Add problematic items to the email
      stockIssues.forEach(item => {
        emailBody += `
          <tr>
            <td>${item.Sponsor_Org_Name}</td>
            <td>${item.Product_Name}</td>
            <td>${item.quantity}</td>
            <td>${item.Quantity}</td>
          </tr>
        `;
      });
      
      emailBody += `
            </table>
            <p>Please adjust your cart and try again.</p>
          </body>
        </html>
      `;
      
      // Send the alert email
      await sendAlertEmail(emailSubject, emailBody);
      
      alert("Some items in your cart have availability issues. Please review your cart.");
      return;
    }
    
    // Process orders for each sponsor separately
    let allSuccessful = true;
    const orderIds = [];
    
    for (const [sponsorId, sponsorData] of Object.entries(groupedCartItems)) {
      const sponsorItems = sponsorData.items;
      const sponsorTotalPoints = totalPointsBySponsors[sponsorId];
      
      try {
        // Prepare order data for this sponsor
        const orderData = {
          driverId: userId,
          userId: userId,
          sponsorOrgId: parseInt(sponsorId),
          items: sponsorItems.map(item => ({
            productId: item.Product_ID,
            quantity: item.quantity,
            pointPrice: item.pointPrice,
            productName: item.Product_Name,
            price: item.Price
          })),
          totalPoints: sponsorTotalPoints,
          orderDate: new Date().toISOString(),
          status: 'Processing' // Set status to Processing instead of Completed
        };
        
        console.log(`Sending order data for sponsor ${sponsorId}:`, JSON.stringify(orderData));
        
        // Make the API call to place the order
        const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        
        // Parse the API response
        const responseData = await response.json();
        console.log(`Order API response for sponsor ${sponsorId}:`, responseData);
        
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to place order");
        }
        
        // Use the actual orderId from the response, or fallback to random if not available
        const orderId = responseData.orderId || Math.floor(Math.random() * 1000000);
        orderIds.push(orderId);
        
      } catch (err) {
        console.error(`Error during checkout for sponsor ${sponsorId}:`, err);
        allSuccessful = false;
        
        // Create and send processing error alert email for this sponsor
        const emailSubject = `Order Alert: Processing Error for ${sponsorData.sponsorName}`;
        
        emailBody = `
          <html>
            <body>
              <h2>Order Alert: Processing Error</h2>
              <p>There was an error processing your order with ${sponsorData.sponsorName}:</p>
              <p><strong>${err.message}</strong></p>
              <p>Our technical team has been notified. Please try again later or contact support.</p>
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
        sponsorItems.forEach(item => {
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
            </body>
          </html>
        `;
        
        // Send the alert email
        await sendAlertEmail(emailSubject, emailBody);
      }
    }
    
    if (allSuccessful) {
      // If all orders were placed successfully, clear the cart
      clearCart();
      
      // Store receipt data for all orders
      const receiptData = {
        orderIds: orderIds,
        orderDate: new Date().toISOString(),
        items: cartItems,
        totalPoints: totalPoints,
        status: 'Processing', // Set status to Processing
        sponsors: Object.values(groupedCartItems).map(sponsor => ({
          sponsorId: sponsor.sponsorId,
          sponsorName: sponsor.sponsorName,
          totalPoints: totalPointsBySponsors[sponsor.sponsorId]
        }))
      };
      localStorage.setItem('latestReceipt', JSON.stringify(receiptData));
      
      // Redirect to receipt page with the first order ID
      router.push(`/pages/driver/receipt?orderId=${orderIds[0]}`);
    } else {
      alert("There was an error processing some of your orders. Please check your email for details.");
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
          <Link href="/pages/driver/sponsors" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse Catalogs
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
      
      <div className="bg-blue-100 p-3 rounded-lg mb-6">
        <p className="font-semibold">Total Cart Value: <span className="text-lg font-bold text-blue-700">{totalPoints.toLocaleString()} points</span></p>
      </div>
      
      {/* Cart items grouped by sponsor */}
      {Object.values(groupedCartItems).map(sponsorGroup => (
        <div key={sponsorGroup.sponsorId} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">
              {sponsorGroup.sponsorName}
            </h2>
            
            <div className="flex items-center space-x-4">
              <p className="text-sm">
                Sponsor Total: <span className="font-bold">{totalPointsBySponsors[sponsorGroup.sponsorId].toLocaleString()} points</span>
              </p>
              
              <p className="text-sm">
                Your Balance: 
                <span className="font-bold text-green-600">
                  {(sponsorPointBalances[sponsorGroup.sponsorId] || 0).toLocaleString()} points
                </span>
              </p>
            </div>
          </div>
          
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
                {sponsorGroup.items.map((item) => (
                  <tr key={`${sponsorGroup.sponsorId}-${item.Product_ID}`}>
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
                          onClick={() => updateItemQuantity(item.Product_ID, item.Sponsor_Org_ID, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 border rounded-md"
                          onClick={() => updateItemQuantity(item.Product_ID, item.Sponsor_Org_ID, item.quantity + 1)}
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
                        onClick={() => removeFromCart(item.Product_ID, item.Sponsor_Org_ID)}
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
                    Sponsor Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {totalPointsBySponsors[sponsorGroup.sponsorId].toLocaleString()} points
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
      
      {/* Checkout Information Alert */}
      <div className="bg-yellow-100 p-4 rounded-lg mb-6 text-sm">
        <p className="font-semibold mb-1">Important Note About Checkout:</p>
        <p>When you place an order, it will be submitted for sponsor approval. Your points will not be deducted until the order is approved.</p>
        <p>You can check your order status and cancel pending orders from your purchase history.</p>
      </div>
      
      {/* Overall cart total and checkout buttons */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 flex justify-between items-center">
        <div className="text-lg font-semibold">
          Cart Total: <span className="font-bold text-blue-700">{totalPoints.toLocaleString()} points</span>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={clearCart}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Clear Cart
          </button>
          
          <Link href="/pages/driver/sponsors" className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center">
            Continue Shopping
          </Link>
          
          <button
            onClick={handleCheckout}
            className="px-6 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}