"use client";
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
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
    // Load wishlist items from localStorage
    const storedWishlist = localStorage.getItem('driverWishlist');
    if (storedWishlist) {
      try {
        const parsedWishlist = JSON.parse(storedWishlist);
        setWishlistItems(parsedWishlist);
      } catch (err) {
        console.error("Error parsing wishlist from localStorage:", err);
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }
    
    // Fetch driver info (points balance)
    fetchDriverInfo();
    
    setLoading(false);
  }, [authorized, userId]);
  
  // Fetch driver information (points balance)
  const fetchDriverInfo = async () => {
    try {
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/Driver/Dashboard/Points?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch driver info: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Calculate total points by summing PointsAdded and subtracting PointsSubbed for each sponsor
        const totalPoints = data.reduce((sum, sponsor) => {
          return sum + sponsor.PointsAdded - sponsor.PointsSubbed; // Adding PointsAdded and subtracting PointsSubbed
        }, 0);
  
        setDriverInfo({
          pointBalance: totalPoints // Set the total points after calculation
        });
      } else {
        console.error("Unexpected data format:", data);
        setDriverInfo({
          pointBalance: 0
        });
      }
    } catch (err) {
      console.error("Error fetching driver info:", err);
      // Set default points for testing
      setDriverInfo({
        pointBalance: 5000
      });
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item.Product_ID !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('driverWishlist', JSON.stringify(updatedWishlist));
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('driverWishlist');
  };
  
  const addToCart = (product) => {
    // Get existing cart or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('driverCart') || '[]');
    
    // Check if product already exists in cart
    const existingProductIndex = existingCart.findIndex(item => item.Product_ID === product.Product_ID);
    
    if (existingProductIndex >= 0) {
      // Update quantity if product exists
      existingCart[existingProductIndex].quantity += 1;
    } else {
      // Add new product with quantity 1
      existingCart.push({
        ...product,
        quantity: 1
      });
    }
    
    // Save updated cart
    localStorage.setItem('driverCart', JSON.stringify(existingCart));
    
    // Show confirmation
    alert(`${product.Product_Name} added to cart!`);
  };
  
  const addAllToCart = () => {
    // Get existing cart or initialize empty array
    const existingCart = JSON.parse(localStorage.getItem('driverCart') || '[]');
    
    // Loop through wishlist items and add to cart
    let updatedCart = [...existingCart];
    
    wishlistItems.forEach(product => {
      // Check if product already exists in cart
      const existingProductIndex = updatedCart.findIndex(item => item.Product_ID === product.Product_ID);
      
      if (existingProductIndex >= 0) {
        // Update quantity if product exists
        updatedCart[existingProductIndex].quantity += 1;
      } else {
        // Add new product with quantity 1
        updatedCart.push({
          ...product,
          quantity: 1
        });
      }
    });
    
    // Save updated cart
    localStorage.setItem('driverCart', JSON.stringify(updatedCart));
    
    // Show confirmation
    alert(`All wishlist items added to cart!`);
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading wishlist...</div>;
  }
  
  if (wishlistItems.length === 0) {
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
        <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-lg mb-4">Your wishlist is empty</p>
          <Link href="/pages/driver/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
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
        <h1 className="text-2xl font-bold">Your Wishlist</h1>
        
        {driverInfo && (
          <div className="bg-blue-100 p-3 rounded-lg">
            <span className="font-semibold">Your Points Balance: </span>
            <span className="text-lg font-bold text-blue-700">{driverInfo.pointBalance.toLocaleString()} points</span>
          </div>
        )}
      </div>
      
      <div className="mb-6 flex space-x-4">
        <button
          onClick={clearWishlist}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Clear Wishlist
        </button>
        
        <button
          onClick={addAllToCart}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Add All to Cart
        </button>
        
        <Link href="/pages/driver/catalog" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Continue Shopping
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((product) => (
          <div 
            key={product.Product_ID} 
            className="border rounded-lg overflow-hidden shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-center mb-4">
                {product.Image_URL ? (
                  <img 
                    src={product.Image_URL} 
                    alt={product.Product_Name} 
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{product.Product_Name}</h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {product.Product_Description || "No description available"}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-bold text-xl text-blue-600">
                    {product.pointPrice.toLocaleString()} points
                  </p>
                  <p className="text-sm text-gray-500">
                    (${parseFloat(product.Price).toFixed(2)} value)
                  </p>
                </div>
                
                {driverInfo && (
                  <div className="text-sm">
                    {product.pointPrice <= driverInfo.pointBalance ? (
                      <span className="text-green-600">You can afford this!</span>
                    ) : (
                      <span className="text-red-600">Need {(product.pointPrice - driverInfo.pointBalance).toLocaleString()} more points</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => addToCart(product)}
                  className="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex-1"
                >
                  Add to Cart
                </button>
                
                <button
                  onClick={() => removeFromWishlist(product.Product_ID)}
                  className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}