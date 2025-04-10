// app/pages/sponsor/catalog/SponsorCatalog.jsx

'use client';

import { useState, useEffect } from 'react';
import ITunesSearch from './ITunesSearch';
import ManageCatalogItem from './components/ManageCatalogItem';
import AddManualItem from './components/AddManualItem';

export default function SponsorCatalog({ sponsorId }) {
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'itunes', or 'add-manual'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pointsRatio, setPointsRatio] = useState(100); // Default: 100 points per dollar
  const [filterOption, setFilterOption] = useState('all'); // 'all', 'featured', 'regular'
  const [sortOption, setSortOption] = useState('default'); // 'default', 'price-asc', 'price-desc', etc.
  const [sponsorInfo, setSponsorInfo] = useState(null);

  // Fetch sponsor information to get points ratio
  useEffect(() => {
    const fetchSponsorInfo = async () => {
      if (!sponsorId) return;
      
      try {
        // This would be a real API call in production
        // For now, we'll use a timeout to simulate an API call and use the default value
        setTimeout(() => {
          // Check project guidelines for the value, otherwise use default
          // From the guidelines: "the default value is $0.01 for each point"
          // This is equivalent to 100 points per dollar
          setSponsorInfo({
            pointsRatio: 100, // 100 points = $1
            sponsorName: 'Test Sponsor',
          });
        }, 500);
      } catch (err) {
        console.error('Error fetching sponsor info:', err);
      }
    };
    
    fetchSponsorInfo();
  }, [sponsorId]);

  // Fetch catalog items for the sponsor
  useEffect(() => {
    const fetchCatalogItems = async () => {
      if (!sponsorId) return;
      
      setLoading(true);
      try {
        // TEMPORARY DEBUG CODE - Log the endpoint we're calling
        console.log(`Fetching catalog items from: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?sponsorId=${sponsorId}`);
        
        const response = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?sponsorId=${sponsorId}`
        );
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // If we get a 404, it means the catalog is empty - that's fine
          if (response.status === 404) {
            console.log('No catalog items found - empty catalog');
            setCatalogItems([]);
            setLoading(false);
            return;
          }
          
          throw new Error(`Error fetching catalog: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Catalog data:', data);
        
        // Manually add Featured flag for testing if it doesn't exist in the API response
        const enhancedData = (data.products || []).map(item => ({
          ...item,
          Featured: item.Featured === undefined ? false : item.Featured
        }));
        
        setCatalogItems(enhancedData);
      } catch (err) {
        console.error('Error fetching catalog items:', err);
        setError(err.message);
        
        // TEMPORARY TESTING CODE - Handle connection errors gracefully
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          setError('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured.');
          
          // Create dummy data for testing
          const dummyData = Array.from({ length: 9 }, (_, index) => ({
            Product_ID: index + 1,
            Product_Name: `Test Product ${index + 1}`,
            Product_Description: 'This is a test product description',
            Price: ((index + 1) * 9.99).toFixed(2),
            Quantity: index + 5,
            Image_URL: index % 3 === 0 ? 'https://placehold.co/200x200/png' : '',
            Created_At: new Date().toISOString(),
            Featured: index === 0 || index === 4 // Feature a couple items by default
          }));
          
          setCatalogItems(dummyData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCatalogItems();
  }, [sponsorId, refreshTrigger]);

  // Refresh the catalog after adding/removing items
  const refreshCatalog = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle adding an item from iTunes to the catalog
  const handleAddFromITunes = async (item) => {
    try {
      // TEMPORARY DEBUG CODE
      console.log('Adding item to catalog:', item);
      console.log('API endpoint:', 'https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog');
      console.log('Request payload:', {
        sponsorId: sponsorId,
        productName: item.trackName || item.collectionName || 'Unknown Item',
        productDescription: item.description || item.longDescription || 'No description available',
        price: item.trackPrice || item.collectionPrice || 0.99,
        quantity: 1,
        imageUrl: item.artworkUrl100 || '',
        featured: false
      });
      
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorId: sponsorId,
          productName: item.trackName || item.collectionName || 'Unknown Item',
          productDescription: item.description || item.longDescription || 'No description available',
          price: item.trackPrice || item.collectionPrice || 0.99,
          quantity: 1,
          imageUrl: item.artworkUrl100 || '',
          featured: false
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error adding item: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      // Just refresh the catalog without showing alerts or changing tabs
      refreshCatalog();
    } catch (err) {
      console.error('Error adding item to catalog:', err);
      
      // TEMPORARY TESTING CODE - Handle connection errors gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        // For testing, we'll simulate success
        
        // Add item to our local state for testing purposes
        const newProduct = {
          Product_ID: Date.now(), // Use timestamp as ID for testing
          Product_Name: item.trackName || item.collectionName || 'Unknown Item',
          Product_Description: item.description || item.longDescription || 'No description available',
          Price: item.trackPrice || item.collectionPrice || 0.99,
          Quantity: 1,
          Image_URL: item.artworkUrl100 || '',
          Created_At: new Date().toISOString(),
          Featured: false
        };
        
        setCatalogItems(prev => [...prev, newProduct]);
      } else {
        console.error(`Error adding item: ${err.message}`);
      }
    }
  };

  // Handle removing an item from the catalog
  const handleRemoveItem = async (productId) => {
    if (!confirm('Are you sure you want to remove this item from your catalog?')) {
      return;
    }
    
    try {
      // TEMPORARY DEBUG CODE
      console.log(`Removing product ID: ${productId}`);
      console.log(`API endpoint: https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?productId=${productId}`);
      
      const response = await fetch(
        `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?productId=${productId}`,
        {
          method: 'DELETE',
        }
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error removing item: ${response.statusText}`);
      }
      
      // TEMPORARY TESTING CODE - Show success even if endpoint isn't working
      // This allows UI testing without a working backend
      alert('Item removed from catalog successfully!');
      
      // In testing, we can directly remove the item from the local state
      // This allows us to test the UI flow without a working backend
      setCatalogItems(prev => prev.filter(item => item.Product_ID !== productId));
      
      // Also remove from selected items if it's there
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Error removing item from catalog:', err);
      
      // TEMPORARY TESTING CODE - Handle connection errors gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        alert('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured.');
        
        // Still remove from UI for testing purposes
        setCatalogItems(prev => prev.filter(item => item.Product_ID !== productId));
        
        // Also remove from selected items if it's there
        setSelectedItems(prev => prev.filter(id => id !== productId));
      } else {
        alert(`Error removing item: ${err.message}`);
      }
    }
  };

  // Handle bulk removal of selected items
  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to remove.');
      return;
    }
    
    if (!confirm(`Are you sure you want to remove ${selectedItems.length} selected items from your catalog?`)) {
      return;
    }
    
    try {
      // In a real app, you'd call your API with the selected item IDs
      console.log(`Removing ${selectedItems.length} items: ${selectedItems.join(', ')}`);
      
      // Show loading state
      setLoading(true);
      
      // Update local state optimistically before API calls complete
      // This makes the UI feel much more responsive
      setCatalogItems(prev => prev.filter(item => !selectedItems.includes(item.Product_ID)));
      
      // Clear selection immediately to prevent accidental re-clicks
      setSelectedItems([]);
      
      // Use Promise.all to send all delete requests in parallel
      // This is much faster than sending them sequentially
      const deletePromises = selectedItems.map(productId => {
        return fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog?productId=${productId}`,
          { method: 'DELETE' }
        )
        .then(response => {
          if (!response.ok) {
            console.error(`Error removing item ${productId}: ${response.statusText}`);
            return { id: productId, success: false };
          }
          return { id: productId, success: true };
        })
        .catch(err => {
          console.error(`Error removing item ${productId}:`, err);
          return { id: productId, success: false };
        });
      });
      
      // Execute all delete operations in parallel
      const results = await Promise.all(deletePromises);
      
      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      setLoading(false);
      
      // Show appropriate message
      if (failureCount === 0) {
        alert('Selected items removed successfully!');
      } else if (successCount === 0) {
        alert('Failed to remove items. Please try again.');
        // Refresh to get accurate state
        refreshCatalog();
      } else {
        alert(`Removed ${successCount} items successfully. ${failureCount} items failed to remove.`);
      }
    } catch (err) {
      console.error('Error during bulk remove operation:', err);
      alert(`Error during bulk removal: ${err.message}`);
      setLoading(false);
      // Refresh to get accurate state
      refreshCatalog();
    }
  };

  // Handle toggle feature status of an item
  const handleToggleFeature = async (productId, featured) => {
    try {
      // In a real app, you'd call your API to update the feature status
      console.log(`Toggling feature status for product ${productId} to ${featured}`);
      
      // Simulate API call for now
      // Update local state
      setCatalogItems(prev => 
        prev.map(item => 
          item.Product_ID === productId 
            ? { ...item, Featured: featured } 
            : item
        )
      );
    } catch (err) {
      console.error('Error updating feature status:', err);
      alert(`Error updating feature status: ${err.message}`);
    }
  };
  
  // Handle updating item quantity
  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      console.log(`Updating quantity for product ${productId} to ${quantity}`);
      
      // Update local state optimistically
      setCatalogItems(prev => 
        prev.map(item => 
          item.Product_ID === productId 
            ? { ...item, Quantity: quantity } 
            : item
        )
      );
      
      // Call the Lambda function API to update the quantity in the database
      const response = await fetch(
        'https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog', 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            quantity: quantity,
            sponsorId: sponsorId
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error updating quantity: ${response.statusText}`);
      }
      
      // If we get here, the update was successful
      console.log('Quantity updated successfully');
    } catch (err) {
      console.error('Error updating quantity:', err);
      
      // Handle connection errors gracefully during testing
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        console.log('API connection error, but continuing with local state update for testing');
      } else {
        alert(`Error updating quantity: ${err.message}`);
      }
    }
  };

  // Handle selecting an item (for bulk operations)
  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Select or deselect all items
  const handleSelectAll = (select) => {
    if (select) {
      // Get IDs of all visible items based on current filter
      let visibleItemIds;
      if (filterOption === 'all') {
        visibleItemIds = catalogItems.map(item => item.Product_ID);
      } else if (filterOption === 'featured') {
        visibleItemIds = catalogItems
          .filter(item => item.Featured)
          .map(item => item.Product_ID);
      } else {
        visibleItemIds = catalogItems
          .filter(item => !item.Featured)
          .map(item => item.Product_ID);
      }
      setSelectedItems(visibleItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  // No longer needed

  // Filter the catalog items based on selected option
  const filteredItems = catalogItems.filter(item => {
    if (filterOption === 'all') return true;
    if (filterOption === 'featured') return item.Featured;
    if (filterOption === 'regular') return !item.Featured;
    return true;
  });

  // Sort the filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'price-asc') {
      return parseFloat(a.Price) - parseFloat(b.Price);
    } else if (sortOption === 'price-desc') {
      return parseFloat(b.Price) - parseFloat(a.Price);
    } else if (sortOption === 'name-asc') {
      return a.Product_Name.localeCompare(b.Product_Name);
    } else if (sortOption === 'name-desc') {
      return b.Product_Name.localeCompare(a.Product_Name);
    } else if (sortOption === 'date-asc') {
      return new Date(a.Created_At) - new Date(b.Created_At);
    } else if (sortOption === 'date-desc') {
      return new Date(b.Created_At) - new Date(a.Created_At);
    } else {
      // Default sort: Featured first, then by date (newest first)
      if (a.Featured && !b.Featured) return -1;
      if (!a.Featured && b.Featured) return 1;
      return new Date(b.Created_At) - new Date(a.Created_At);
    }
  });

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`px-4 py-2 ${activeTab === 'catalog' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('catalog')}
          >
            My Catalog
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'itunes' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => {
              setActiveTab('itunes');
            }}
          >
            Add from iTunes
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'add-manual' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('add-manual')}
          >
            Add Item Manually
          </button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div>
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-xl font-bold">My Catalog Items</h2>
              <p className="text-sm text-gray-600">
                Point conversion rate: {pointsRatio} points = $1.00
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Filter and Sort Controls */}
              <select
                className="p-2 border rounded text-sm"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="featured">Featured Only</option>
                <option value="regular">Regular Only</option>
              </select>
              
              <select
                className="p-2 border rounded text-sm"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="date-desc">Date: Newest First</option>
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-sm font-medium">
                {selectedItems.length > 0 
                  ? `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected` 
                  : 'Select All'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBulkRemove}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded disabled:opacity-50"
              >
                Remove Selected
              </button>
              
              <button
                onClick={() => {
                  // Feature all selected items
                  selectedItems.forEach(id => handleToggleFeature(id, true));
                }}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded disabled:opacity-50"
              >
                Feature Selected
              </button>
              
              <button
                onClick={() => {
                  // Unfeature all selected items
                  selectedItems.forEach(id => handleToggleFeature(id, false));
                }}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded disabled:opacity-50"
              >
                Unfeature Selected
              </button>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center">Loading catalog items...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : sortedItems.length === 0 ? (
            <p className="text-center p-4 bg-gray-50 rounded-lg">
              {filterOption !== 'all' 
                ? `No ${filterOption} items found in your catalog.` 
                : 'Your catalog is empty. Add items from iTunes or manually.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedItems.map(item => (
                <ManageCatalogItem 
                  key={item.Product_ID} 
                  item={item} 
                  onRemove={() => handleRemoveItem(item.Product_ID)} 
                  onToggleFeature={handleToggleFeature}
                  isSelected={selectedItems.includes(item.Product_ID)}
                  onSelect={handleSelectItem}
                  pointsRatio={pointsRatio}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'itunes' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Add from iTunes</h2>
            <p className="text-sm text-gray-600">
              Select items individually or use the checkboxes to bulk add multiple items at once.
            </p>
          </div>
          
          <ITunesSearch 
            onAddToCatalog={handleAddFromITunes} 
            pointsRatio={pointsRatio}
            catalogItems={catalogItems}
          />
        </div>
      )}

      {activeTab === 'add-manual' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Add Item Manually</h2>
          <AddManualItem 
            sponsorId={sponsorId} 
            onItemAdded={() => {
              refreshCatalog();
              setActiveTab('catalog');
            }} 
          />
        </div>
      )}
    </div>
  );
}