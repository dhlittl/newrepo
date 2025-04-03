"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DriverCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [sponsorInfo, setSponsorInfo] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [filteredCatalog, setFilteredCatalog] = useState([]);
  
  // Sorting and filtering states
  const [sortOption, setSortOption] = useState('default');
  const [filterOption, setFilterOption] = useState('all');
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  
  // For testing purposes - in production, this would come from authentication
  const [userId, setUserId] = useState(1); // Default test user
  const [sponsorId, setSponsorId] = useState(null);
  
  useEffect(() => {
    // Get sponsorId from URL params or default to the first available
    const urlSponsorId = searchParams.get('sponsorId');
    if (urlSponsorId) {
      setSponsorId(urlSponsorId);
    } else {
      // If no sponsorId provided, we'll load the driver's sponsors and select the first one
      fetchDriverSponsors();
    }
  }, [searchParams]);
  
  // Fetch the driver's associated sponsors
  const fetchDriverSponsors = async () => {
    try {
      // This would be replaced with a real API call to get the driver's sponsors
      // For now, let's simulate with a dummy API call
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/drivers/${userId}/sponsors`);
      
      if (!response.ok) {
        // For testing, let's default to a sponsor ID
        console.log("Defaulting to test sponsor ID 1");
        setSponsorId(1);
        return;
      }
      
      const data = await response.json();
      if (data.sponsors && data.sponsors.length > 0) {
        setSponsorId(data.sponsors[0].sponsorId);
      } else {
        setError("No sponsors found for this driver.");
      }
    } catch (err) {
      console.error("Error fetching driver sponsors:", err);
      // For testing purposes, default to sponsor ID 1
      setSponsorId(1);
    }
  };
  
  // Fetch catalog items when sponsorId changes
  useEffect(() => {
    if (sponsorId) {
      fetchCatalog();
      fetchDriverInfo();
    }
  }, [sponsorId]);
  
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
  
  // Fetch catalog items
  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?sponsorId=${sponsorId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching catalog: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to include point prices
      const pointsRatio = 100; // Assuming 100 points per dollar as mentioned in SponsorCatalog.jsx
      const processedCatalog = data.products.map(item => ({
        ...item,
        pointPrice: Math.ceil(parseFloat(item.Price) * pointsRatio)
      }));
      
      setCatalog(processedCatalog);
      
      // Also fetch sponsor info to get the actual points ratio
      fetchSponsorInfo();
    } catch (err) {
      console.error("Error fetching catalog:", err);
      setError(err.message);
      
      // For testing, create dummy catalog data
      const dummyData = Array.from({ length: 9 }, (_, index) => ({
        Product_ID: index + 1,
        Product_Name: `Test Product ${index + 1}`,
        Product_Description: 'This is a test product description',
        Price: ((index + 1) * 9.99).toFixed(2),
        pointPrice: ((index + 1) * 9.99 * 100), // 100 points per dollar
        Quantity: index + 5,
        Image_URL: index % 3 === 0 ? 'https://placehold.co/200x200/png' : '',
        Created_At: new Date().toISOString(),
        Featured: index === 0 || index === 4
      }));
      
      setCatalog(dummyData);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch sponsor info to get points ratio
  const fetchSponsorInfo = async () => {
    try {
      // This would be a real API call in production
      const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/${sponsorId}`);
      
      if (!response.ok) {
        // Default to 100 points per dollar (0.01 per point)
        setSponsorInfo({
          name: "Test Sponsor",
          pointsRatio: 100
        });
        return;
      }
      
      const data = await response.json();
      setSponsorInfo({
        name: data.Sponsor_Org_Name || "Test Sponsor",
        pointsRatio: data.Points_Ratio || 100
      });
    } catch (err) {
      console.error("Error fetching sponsor info:", err);
      setSponsorInfo({
        name: "Test Sponsor",
        pointsRatio: 100
      });
    }
  };
  
  // Apply filters and sorting to the catalog
  useEffect(() => {
    if (!catalog) return;
    
    let filtered = [...catalog];
    
    // Apply price filter
    if (minPoints && !isNaN(minPoints)) {
      filtered = filtered.filter(item => item.pointPrice >= parseInt(minPoints));
    }
    
    if (maxPoints && !isNaN(maxPoints)) {
      filtered = filtered.filter(item => item.pointPrice <= parseInt(maxPoints));
    }
    
    // Apply affordability filter
    if (filterOption === 'affordable' && driverInfo) {
      filtered = filtered.filter(item => item.pointPrice <= driverInfo.pointBalance);
    }
    
    // Apply featured filter
    if (filterOption === 'featured') {
      filtered = filtered.filter(item => item.Featured);
    }
    
    // Apply sorting
    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.pointPrice - b.pointPrice);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.pointPrice - a.pointPrice);
    } else if (sortOption === 'name-asc') {
      filtered.sort((a, b) => a.Product_Name.localeCompare(b.Product_Name));
    } else if (sortOption === 'name-desc') {
      filtered.sort((a, b) => b.Product_Name.localeCompare(a.Product_Name));
    } else if (sortOption === 'date-asc') {
      filtered.sort((a, b) => new Date(a.Created_At) - new Date(b.Created_At));
    } else if (sortOption === 'date-desc') {
      filtered.sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At));
    } else {
      // Default sort: Featured items first, then by date
      filtered.sort((a, b) => {
        if (a.Featured && !b.Featured) return -1;
        if (!a.Featured && b.Featured) return 1;
        return new Date(b.Created_At) - new Date(a.Created_At);
      });
    }
    
    setFilteredCatalog(filtered);
  }, [catalog, sortOption, filterOption, minPoints, maxPoints, driverInfo]);
  
  // Add to cart functionality
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
  
  // Add to wishlist functionality
  const addToWishlist = (product) => {
    // Get existing wishlist or initialize empty array
    const existingWishlist = JSON.parse(localStorage.getItem('driverWishlist') || '[]');
    
    // Check if product already exists in wishlist
    const productExists = existingWishlist.some(item => item.Product_ID === product.Product_ID);
    
    if (!productExists) {
      // Add product to wishlist
      existingWishlist.push(product);
      
      // Save updated wishlist
      localStorage.setItem('driverWishlist', JSON.stringify(existingWishlist));
      
      // Show confirmation
      alert(`${product.Product_Name} added to wishlist!`);
    } else {
      alert("This item is already in your wishlist!");
    }
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading catalog...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rewards Catalog</h1>
        
        {driverInfo && (
          <div className="bg-blue-100 p-3 rounded-lg">
            <span className="font-semibold">Your Points Balance: </span>
            <span className="text-lg font-bold text-blue-700">{driverInfo.pointBalance.toLocaleString()} points</span>
          </div>
        )}
      </div>
      
      {/* Navigation toolbar */}
      <div className="flex space-x-4 mb-6">
        <Link href="/pages/driver/cart" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          View Cart
        </Link>
        <Link href="/pages/driver/wishlist" className="bg-purple-500 text-white px-4 py-2 rounded-md">
          View Wishlist
        </Link>
        <Link href="/pages/driver/purchase-history" className="bg-green-500 text-white px-4 py-2 rounded-md">
          Purchase History
        </Link>
      </div>
      
      {/* Filtering and sorting controls */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Products</label>
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Products</option>
              <option value="affordable">Items I Can Afford</option>
              <option value="featured">Featured Items</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="date-asc">Oldest First</option>
              <option value="date-desc">Newest First</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value)}
                className="p-2 border rounded-md w-24"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="p-2 border rounded-md w-24"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Catalog Items */}
      {filteredCatalog.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          No products found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((product) => (
            <div 
              key={product.Product_ID} 
              className={`border rounded-lg overflow-hidden shadow-md ${product.Featured ? 'border-yellow-400 bg-yellow-50' : ''}`}
            >
              {product.Featured && (
                <div className="bg-yellow-400 text-yellow-900 text-center text-sm font-semibold py-1">
                  Featured Item
                </div>
              )}
              
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
                  
                  <div className="text-sm text-gray-500">
                    {product.Quantity > 0 ? `In stock: ${product.Quantity}` : "Out of stock"}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.Quantity <= 0}
                    className={`px-3 py-2 rounded-md text-white ${
                      product.Quantity <= 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => addToWishlist(product)}
                    className="px-3 py-2 rounded-md bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Add to Wishlist
                  </button>
                </div>
                
                {driverInfo && product.pointPrice > driverInfo.pointBalance && (
                  <div className="mt-2 text-xs text-red-500">
                    You need {(product.pointPrice - driverInfo.pointBalance).toLocaleString()} more points to afford this item
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}