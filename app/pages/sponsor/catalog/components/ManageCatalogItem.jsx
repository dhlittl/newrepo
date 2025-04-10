// app/pages/sponsor/catalog/components/ManageCatalogItem.jsx

'use client';

import { useState } from 'react';

const ManageCatalogItem = ({ item, onRemove, onToggleFeature, isSelected, onSelect, pointsRatio, onUpdateQuantity }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [quantityValue, setQuantityValue] = useState(item.Quantity || 0);
  
  // Format timestamp
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate the point value based on the price
  const pointPrice = item.Price ? Math.ceil(parseFloat(item.Price) * pointsRatio) : 0;

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantityValue(isNaN(value) ? 0 : Math.max(0, value));
  };

  // Handle quantity save
  const handleQuantitySave = () => {
    onUpdateQuantity(item.Product_ID, quantityValue);
    setIsEditingQuantity(false);
  };

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
              
              <div className="text-sm">
                {isEditingQuantity ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={quantityValue}
                      onChange={handleQuantityChange}
                      className="w-16 p-1 border rounded text-center"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleQuantitySave}
                        className="p-1 bg-blue-500 text-white rounded"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setQuantityValue(item.Quantity || 0);
                          setIsEditingQuantity(false);
                        }}
                        className="p-1 bg-gray-300 rounded"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingQuantity(true)}
                    className="text-blue-600 hover:underline flex items-center"
                    title="Edit Quantity"
                  >
                    <span>Qty: {item.Quantity || 0}</span>
                    <span className="ml-1 text-xs">✏️</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t flex justify-between items-center">
          <div>Added: {formatDate(item.Created_At)}</div>
          
          {confirmDelete ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={onRemove}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Confirm
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setConfirmDelete(true)}
              className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCatalogItem;