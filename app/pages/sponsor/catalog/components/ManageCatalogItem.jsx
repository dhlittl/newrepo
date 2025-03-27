// app/pages/sponsor/catalog/components/ManageCatalogItem.jsx

'use client';

import { useState } from 'react';

const ManageCatalogItem = ({ item, onRemove }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
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

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <div className="flex flex-col h-full">
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
              <div className="font-bold text-blue-600">
                {item.Price ? `$${parseFloat(item.Price).toFixed(2)}` : 'Price not set'}
              </div>
              
              <div className="text-sm text-gray-500">
                Qty: {item.Quantity || 0}
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