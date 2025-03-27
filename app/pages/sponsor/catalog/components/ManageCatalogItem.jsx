// app/pages/sponsor/catalog/components/ManageCatalogItem.jsx
'use client';

import { formatDate, calculatePointPrice } from '@/utils/catalog';
import ConfirmButton from '@/components/ui/ConfirmButton';

const ManageCatalogItem = ({ item, onRemove, onToggleFeature, isSelected, onSelect, pointsRatio }) => {
  // Calculate the point value based on the price
  const pointPrice = item.Price ? calculatePointPrice(parseFloat(item.Price), pointsRatio) : 0;

  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : ''} ${item.Featured ? 'border-yellow-400 bg-yellow-50' : ''}`}>
      <div className="flex flex-col h-full">
        {/* Checkbox for bulk selection */}
        <div className="p-2 flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(item.Product_ID)}
              className="h-4 w-4 mr-2 cursor-pointer"
            />
            {item.Featured && (
              <span className="bg-yellow-300 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
          </div>
          
          <button
            onClick={() => onToggleFeature(item.Product_ID, !item.Featured)}
            className={`text-xs px-2 py-1 rounded-full ${item.Featured ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}
          >
            {item.Featured ? 'Unfeature' : 'Feature'}
          </button>
        </div>
        
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            {item.Image_URL ? (
              <img 
                src={item.Image_URL} 
                alt={item.Product_Name} 
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="font-medium text-lg">{item.Product_Name}</h3>
            
            <div className="text-sm text-gray-600 mt-1 line-clamp-3">
              {item.Product_Description || 'No description available'}
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div>
                <div className="font-bold text-blue-600">
                  {pointPrice.toLocaleString()} points
                </div>
                <div className="text-xs text-gray-500">
                  (${parseFloat(item.Price).toFixed(2)} value)
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Qty: {item.Quantity || 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t flex justify-between items-center">
          <div>Added: {formatDate(item.Created_At)}</div>
          
          <ConfirmButton
            onConfirm={onRemove}
            buttonText="Remove"
            buttonClass="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
            confirmText="Confirm"
            cancelText="Cancel"
          />
        </div>
      </div>
    </div>
  );
};

export default ManageCatalogItem;