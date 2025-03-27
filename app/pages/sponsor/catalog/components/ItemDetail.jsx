// app/pages/sponsor/catalog/components/ItemDetail.jsx
'use client';

import { useState, useEffect } from 'react';

const ItemDetail = ({ item, onClose, onAddToCatalog, pointsRatio = 100 }) => {
  const [isAdded, setIsAdded] = useState(false);
  
  if (!item) return null;
  
  // Listen for item-added events
  useEffect(() => {
    const handleItemAdded = (event) => {
      const itemId = item.trackId || item.collectionId;
      if (event.detail.id === itemId) {
        setIsAdded(true);
      }
    };
    
    window.addEventListener('item-added', handleItemAdded);
    return () => {
      window.removeEventListener('item-added', handleItemAdded);
    };
  }, [item]);

  // Determine content-specific fields
  const displayName = item.trackName || item.collectionName || 'Unknown Item';
  const artist = item.artistName || 'Unknown Artist';
  
  // Price and points conversion
  const dollarPrice = item.trackPrice !== undefined 
    ? item.trackPrice 
    : item.collectionPrice !== undefined 
      ? item.collectionPrice 
      : null;
      
  const formattedPrice = dollarPrice !== null 
    ? `${dollarPrice.toFixed(2)}` 
    : 'Not available';
    
  const pointPrice = dollarPrice !== null 
    ? Math.ceil(dollarPrice * pointsRatio) 
    : null;
  
  // Format release date
  let releaseDate = '';
  if (item.releaseDate) {
    releaseDate = new Date(item.releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Determine the media type display
  let mediaTypeDisplay = item.wrapperType || 'unknown type';
  if (item.wrapperType === 'track' && item.kind) {
    mediaTypeDisplay = item.kind;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start p-4 border-b">
          <h2 className="text-xl font-semibold">{displayName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <img 
              src={item.artworkUrl100 || '/placeholder-image.jpg'} 
              alt={displayName}
              className="w-32 h-32 object-cover rounded"
            />
          </div>
          
          <div className="flex-grow">
            <p className="text-gray-600 mb-2">{artist}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold">Type:</div>
              <div className="capitalize">{mediaTypeDisplay}</div>
              
              <div className="font-semibold">Dollar Price:</div>
              <div className="font-bold text-blue-600">{formattedPrice}</div>
              
              {pointPrice !== null && (
                <>
                  <div className="font-semibold">Point Price:</div>
                  <div className="font-bold text-green-600">{pointPrice.toLocaleString()} points</div>
                </>
              )}
              
              {releaseDate && (
                <>
                  <div className="font-semibold">Released:</div>
                  <div>{releaseDate}</div>
                </>
              )}
              
              {item.trackTimeMillis && (
                <>
                  <div className="font-semibold">Duration:</div>
                  <div>{Math.floor(item.trackTimeMillis / 60000)}:{String(Math.floor((item.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}</div>
                </>
              )}
              
              {item.primaryGenreName && (
                <>
                  <div className="font-semibold">Genre:</div>
                  <div>{item.primaryGenreName}</div>
                </>
              )}
              
              {item.contentAdvisoryRating && (
                <>
                  <div className="font-semibold">Rating:</div>
                  <div>{item.contentAdvisoryRating}</div>
                </>
              )}
            </div>
            
            {item.previewUrl && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Preview:</p>
                <audio 
                  src={item.previewUrl} 
                  controls 
                  className="w-full"
                ></audio>
              </div>
            )}
          </div>
        </div>
        
        {item.description && (
          <div className="p-4 border-t">
            <p className="font-semibold mb-1">Description:</p>
            <p className="text-sm">{item.description}</p>
          </div>
        )}
        
        {item.longDescription && (
          <div className="p-4 border-t">
            <p className="font-semibold mb-1">Full Description:</p>
            <p className="text-sm">{item.longDescription}</p>
          </div>
        )}
        
        <div className="p-4 border-t flex justify-between">
          {item.trackViewUrl && (
            <a 
              href={item.trackViewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              View on iTunes
            </a>
          )}
          
          {isAdded ? (
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
            >
              Added to Catalog
            </button>
          ) : (
            <button
              onClick={() => {
                onAddToCatalog(item);
                // Don't close the modal, just update local state to show it's been added
                const addedEvent = new CustomEvent('item-added', { 
                  detail: { id: item.trackId || item.collectionId } 
                });
                window.dispatchEvent(addedEvent);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Add to Catalog ({pointPrice?.toLocaleString() || '?'} points)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;