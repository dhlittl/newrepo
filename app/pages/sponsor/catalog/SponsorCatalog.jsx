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
        setCatalogItems(data.products || []);
      } catch (err) {
        console.error('Error fetching catalog items:', err);
        setError(err.message);
        
        // TEMPORARY TESTING CODE - Handle connection errors gracefully
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          setError('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured.');
          setCatalogItems([]); // Set empty array to allow testing other features
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
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error adding item: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      
      alert('Item added to catalog successfully!');
      refreshCatalog();
      setActiveTab('catalog'); // Return to catalog view
    } catch (err) {
      console.error('Error adding item to catalog:', err);
      
      // TEMPORARY TESTING CODE - Handle connection errors gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        alert('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured.');
      } else {
        alert(`Error adding item: ${err.message}`);
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
    } catch (err) {
      console.error('Error removing item from catalog:', err);
      
      // TEMPORARY TESTING CODE - Handle connection errors gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        alert('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured.');
        
        // Still remove from UI for testing purposes
        setCatalogItems(prev => prev.filter(item => item.Product_ID !== productId));
      } else {
        alert(`Error removing item: ${err.message}`);
      }
    }
  };

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
            onClick={() => setActiveTab('itunes')}
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
          <h2 className="text-xl font-bold mb-4">My Catalog Items</h2>
          
          {loading ? (
            <p className="text-center">Loading catalog items...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : catalogItems.length === 0 ? (
            <p className="text-center p-4 bg-gray-50 rounded-lg">
              Your catalog is empty. Add items from iTunes or manually.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogItems.map(item => (
                <ManageCatalogItem 
                  key={item.Product_ID} 
                  item={item} 
                  onRemove={() => handleRemoveItem(item.Product_ID)} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'itunes' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Add from iTunes</h2>
          <ITunesSearch onAddToCatalog={handleAddFromITunes} />
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