// components/catalog/ItemCard.jsx
"use client";

import { getDisplayName, getDollarPrice, formatPriceDisplay, calculatePointPrice, getMediaTypeDisplay } from '@/utils/catalog';

/**
 * Reusable card component for displaying iTunes products
 */
const ItemCard = ({ 
  item, 
  onAddToCatalog, 
  onSelect, 
  onViewDetails, 
  isSelected, 
  isAdded, 
  pointsRatio 
}) => {
  const uniqueKey = item.trackId || item.collectionId;
  const displayName = getDisplayName(item);
  const dollarPrice = getDollarPrice(item);
  const priceDisplay = formatPriceDisplay(dollarPrice);
  const pointPrice = calculatePointPrice(dollarPrice, pointsRatio);
  const mediaTypeDisplay = getMediaTypeDisplay(item);
  
  // Format release date
  let releaseDate = '';
  if (item.releaseDate) {
    releaseDate = new Date(item.releaseDate).toLocaleDateString();
  }
  
  return (
    <div className="border rounded p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {/* Item selection checkbox */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
          {mediaTypeDisplay}
        </div>
        {!isAdded && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(uniqueKey)}
            className="h-4 w-4 cursor-pointer"
          />
        )}
      </div>
      
      <img 
        src={item.artworkUrl100 || '/placeholder-image.jpg'} 
        alt={displayName} 
        className="w-24 h-24 object-cover mx-auto mb-2 rounded"
      />
      <h3 className="font-medium text-lg line-clamp-2">
        {displayName}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {item.artistName || 'Unknown Artist'}
      </p>
      <div className="mt-auto pt-2 flex flex-col gap-1">
        <div className="flex flex-col">
          <p className="font-bold text-blue-600">
            {priceDisplay}
          </p>
          {pointPrice !== null && (
            <p className="text-green-600 font-medium">
              {pointPrice.toLocaleString()} points
            </p>
          )}
        </div>
        {releaseDate && (
          <p className="text-xs text-gray-500">
            Released: {releaseDate}
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onViewDetails(item)}
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition text-sm"
        >
          View Details
        </button>
        {isAdded ? (
          <button
            disabled
            className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
          >
            Added
          </button>
        ) : (
          <button
            onClick={() => onAddToCatalog(item)}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm"
          >
            Add to Catalog
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;