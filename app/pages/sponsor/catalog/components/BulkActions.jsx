// app/pages/sponsor/catalog/components/BulkActions.jsx
'use client';

const BulkActions = ({ 
  selectedItems, 
  totalItems, 
  onSelectAll, 
  onBulkRemove, 
  onBulkFeature, 
  onBulkUnfeature
}) => {
  return (
    <div className="mb-4 bg-gray-50 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selectedItems.length > 0 && selectedItems.length === totalItems}
          onChange={(e) => onSelectAll(e.target.checked)}
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
          onClick={onBulkRemove}
          disabled={selectedItems.length === 0}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded disabled:opacity-50"
        >
          Remove Selected
        </button>
        
        <button
          onClick={onBulkFeature}
          disabled={selectedItems.length === 0}
          className="px-3 py-1 text-sm bg-yellow-500 text-white rounded disabled:opacity-50"
        >
          Feature Selected
        </button>
        
        <button
          onClick={onBulkUnfeature}
          disabled={selectedItems.length === 0}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Unfeature Selected
        </button>
      </div>
    </div>
  );
};

export default BulkActions;