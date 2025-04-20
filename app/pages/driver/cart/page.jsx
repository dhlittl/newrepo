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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
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
  
  // Get user's email address
  const getUserEmail = async () => {
    try {
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
      
      return userEmail;
    } catch (error) {
      console.error("Error fetching user email:", error);
      throw error;
    }
  };
  
  // Check if the driver has notifications enabled
  const checkNotificationPreference = async (preferenceType) => {
    try {
      // Get driver notification preferences
      console.log(`Checking notification preferences for user ${userId} (preference type: ${preferenceType})`);
      
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Team24-DriverNotificationPreferences?userId=${userId}`
      );
      
      if (!response.ok) {
        console.error("Failed to retrieve notification preferences, status:", response.status);
        // Default to true if we can't fetch preferences
        return true;
      }
      
      const data = await response.json();
      console.log("Notification preferences:", data);
      
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
      console.error("Error checking notification preferences:", err);
      // Default to true if error occurs
      return true;
    }
  };
  
  // Send alert email - SIMPLIFIED VERSION
  const sendAlertEmail = async (subject, body, emailType) => {
    try {
      // Check notification preferences
      const notificationsEnabled = await checkNotificationPreference(emailType);
      console.log(`${emailType} notifications enabled:`, notificationsEnabled);
      
      if (!notificationsEnabled) {
        console.log(`User has disabled ${emailType} notifications, skipping email`);
        return false;
      }
      
      // Get user email
      const userEmail = await getUserEmail();
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
        return false;
      } else {
        console.log("Alert email sent successfully");
        return true;
      }
    } catch (emailError) {
      console.error("Error in email process:", emailError);
      return false;
    }
  };

  // Create and send insufficient points alert email
  const sendInsufficientPointsEmail = async (sponsorData, sponsorTotalPoints, pointBalance) => {
    const emailSubject = `Order Alert: Insufficient Points for ${sponsorData.sponsorName}`;
    
    let emailBody = `
      <html>
        <body>
          <h2>Order Alert: Insufficient Points</h2>
          <p>Your order with ${sponsorData.sponsorName} could not be processed because you don't have enough points:</p>
          <ul>
            <li><strong>Order Total:</strong> ${sponsorTotalPoints.toLocaleString()} points</li>
            <li><strong>Your Balance:</strong> ${pointBalance.toLocaleString()} points</li>
            <li><strong>Shortage:</strong> ${(sponsorTotalPoints - pointBalance).toLocaleString()} points</li>
          </ul>
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
    sponsorData.items.forEach(item => {
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
          <p>Please earn more points or adjust your cart before attempting to checkout again.</p>
        </body>
      </html>
    `;
    
    // Send the alert email - specify 'orderProblem' as the email type
    return await sendAlertEmail(emailSubject, emailBody, 'orderProblem');
  };

  // Modified handleCheckout function with loading state
  const handleCheckout = async () => {
    // Set loading state to true at the beginning
    setIsCheckingOut(true);
    
    try {
      // First, check if drivers have enough points with each sponsor
      for (const [sponsorId, sponsorData] of Object.entries(groupedCartItems)) {
        const sponsorTotalPoints = totalPointsBySponsors[sponsorId];
        const pointBalance = sponsorPointBalances[sponsorId] || 0;
        
        if (sponsorTotalPoints > pointBalance) {
          // Send email about insufficient points - separate function for clarity
          await sendInsufficientPointsEmail(sponsorData, sponsorTotalPoints, pointBalance);
          
          // Reset loading state before showing alert
          setIsCheckingOut(false);
          alert(`You don't have enough points with ${sponsorData.sponsorName}. Your order requires ${sponsorTotalPoints.toLocaleString()} points, but you only have ${pointBalance.toLocaleString()} points.`);
          return;
        }
      }

      // Process orders for each sponsor separately
      let allSuccessful = true;
      const allOrders = [];
      const orderIds = [];
      
      for (const [sponsorId, sponsorData] of Object.entries(groupedCartItems)) {
        const sponsorItems = sponsorData.items;
        const sponsorTotalPoints = totalPointsBySponsors[sponsorId];
        
        try {
          // Order data preparation
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
            status: 'Processing'
          };
          
          // API call to place the order
          const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            throw new Error(responseData.error || "Failed to place order");
          }
          
          const orderId = responseData.orderId || Math.floor(Math.random() * 1000000);
          orderIds.push(orderId);
          
          // Save order information for combined receipt
          allOrders.push({
            orderId,
            sponsorId,
            sponsorName: sponsorData.sponsorName,
            totalPoints: sponsorTotalPoints,
            items: sponsorItems,
            orderDate: new Date().toISOString(),
            status: 'Processing'
          });

          // Store the individual order receipt for later reference
          // This is the same format as before, for compatibility with the existing receipt page
          const individualReceipt = {
            orderIds: [orderId],
            orderId: orderId,
            orderDate: new Date().toISOString(),
            status: 'Processing',
            totalPoints: sponsorTotalPoints,
            items: sponsorItems,
            sponsorName: sponsorData.sponsorName,
            sponsorId: sponsorId
          };
          
          // Only store as latest receipt if this is the only order
          if (Object.keys(groupedCartItems).length === 1) {
            localStorage.setItem('latestReceipt', JSON.stringify(individualReceipt));
          }

          // Send confirmation email
          const emailSubject = `Order Confirmation: Your order has been submitted`;
          
          let emailBody = `
            <html>
              <body>
                <h2>Order Confirmation</h2>
                <p>Your order with ${sponsorData.sponsorName} has been submitted and is awaiting sponsor approval:</p>
                <p><strong>Order #:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Points:</strong> ${sponsorTotalPoints.toLocaleString()}</p>
                
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
                <p><strong>Important Note:</strong> Points will not be deducted from your balance until the sponsor approves your order.</p>
                <p>You can check your order status or cancel this order (if still pending) from your purchase history page.</p>
              </body>
            </html>
          `;
          
          // Send the confirmation email
          await sendAlertEmail(emailSubject, emailBody, 'orderStatus');
          
        } catch (err) {
          console.error(`Error during checkout for sponsor ${sponsorId}:`, err);
          allSuccessful = false;
        }
      }
      
      if (allSuccessful) {
        // Clear cart
        clearCart();
        
        // Create combined receipt data
        const combinedReceipt = {
          orders: allOrders,
          orderIds: orderIds,
          orderDate: new Date().toISOString(),
          totalPoints: totalPoints,
          status: 'Processing'
        };
        
        // Determine where to redirect based on number of orders
        if (allOrders.length > 1) {
          // For multiple orders, store the combined receipt and go to the combined receipt page
          localStorage.setItem('combinedReceipt', JSON.stringify(combinedReceipt));
          router.push('/pages/driver/combined-receipt');
        } else if (allOrders.length === 1) {
          // For single order, go directly to the regular receipt page
          // latestReceipt is already set above
          router.push(`/pages/driver/receipt?orderId=${orderIds[0]}`);
        } else {
          // Fallback if no orders were created successfully
          router.push('/pages/driver/purchase-history');
        }
      } else {
        // Reset loading state before showing alert for error case
        setIsCheckingOut(false);
        alert("There was an error processing some of your orders. Please check your email for details.");
      }
    } catch (error) {
      // Reset loading state in case of any uncaught exceptions
      setIsCheckingOut(false);
      console.error("Checkout process error:", error);
      alert("An unexpected error occurred during checkout. Please try again.");
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

    {isCheckingOut && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Processing Your Order</h3>
            <p className="text-gray-600 text-center">
              Please wait while we process your order. This may take a few moments.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Do not refresh or navigate away from this page.
            </p>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}