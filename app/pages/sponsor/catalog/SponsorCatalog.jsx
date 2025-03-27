// app/pages/sponsor/catalog/SponsorCatalog.jsx
'use client';

import { useState, useEffect } from 'react';
import ITunesSearch from './ITunesSearch';
import AddManualItem from './components/AddManualItem';
import ManageCatalogItem from './components/ManageCatalogItem';
import CatalogTabs from './components/CatalogTabs';
import BulkActions from './components/BulkActions';
import { useCatalog } from '@/hooks/useCatalog';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { useSelection } from '@/hooks/useSelection';
import { SORT_OPTIONS } from '@/constants/itunesMedia';

export default function SponsorCatalog({ sponsorId }) {
  // Set up state and hooks
  const [activeTab, setActiveTab] = useState('catalog');
  const [pointsRatio, setPointsRatio] = useState(100); // Default: 100 points per dollar
  
  // Custom hooks for catalog operations
  const { 
    catalogItems, 
    loading, 
    error, 
    refreshCatalog, 
    addItem, 
    removeItem, 
    toggleFeature,
    bulkRemove,
    bulkToggleFeature
  } = useCatalog(sponsorId);
  
  // Custom hook for filtering and sorting
  const { 
    filteredItems, 
    filterOption, 
    setFilterOption, 
    sortOption, 
    setSortOption 
  } = useCatalogFilters(catalogItems);
  
  // Custom hook for selection management
  const { 
    selectedItems, 
    toggleSelectItem, 
    handleSelectAll, 
    clearSelection 
  } = useSelection();
  
  // Handle adding an item from iTunes to the catalog
  const handleAddFromITunes = async (item) => {
    const success = await addItem(item);
    if (success) {
      // Leave the user on the iTunes tab - they'll likely want to add more items
      return true;
    } else {
      alert('Failed to add item. Please try again.');
      return false;
    }
  };
  
  // Handle removing an item from the catalog
  const handleRemoveItem = async (productId) => {
    if (!confirm('Are you sure you want to remove this item from your catalog?')) {
      return;
    }
    
    const success = await removeItem(productId);
    if (success) {
      // Also remove from selected items if it's there
      if (selectedItems.includes(productId)) {
        toggleSelectItem(productId);
      }
    } else {
      alert('Failed to remove item. Please try again.');
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
    
    const success = await bulkRemove(selectedItems);
    if (success) {
      clearSelection();
    } else {
      alert('Failed to remove some items. Please try again.');
      refreshCatalog();
    }
  };
  
  // Handle bulk feature/unfeature operations
  const handleBulkFeature = async () => {
    const success = await bulkToggleFeature(selectedItems, true);
    if (!success) {
      alert('Failed to update feature status for some items.');
    }
  };
  
  const handleBulkUnfeature = async () => {
    const success = await bulkToggleFeature(selectedItems, false);
    if (!success) {
      alert('Failed to update feature status for some items.');
    }
  };

  return (
    <div className="container mx-auto">
      <CatalogTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <BulkActions 
            selectedItems={selectedItems}
            totalItems={filteredItems.length}
            onSelectAll={(select) => handleSelectAll(filteredItems, select)}
            onBulkRemove={handleBulkRemove}
            onBulkFeature={handleBulkFeature}
            onBulkUnfeature={handleBulkUnfeature}
          />
          
          {loading ? (
            <p className="text-center">Loading catalog items...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center p-4 bg-gray-50 rounded-lg">
              {filterOption !== 'all' 
                ? `No ${filterOption} items found in your catalog.` 
                : 'Your catalog is empty. Add items from iTunes or manually.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <ManageCatalogItem 
                  key={item.Product_ID} 
                  item={item} 
                  onRemove={() => handleRemoveItem(item.Product_ID)} 
                  onToggleFeature={toggleFeature}
                  isSelected={selectedItems.includes(item.Product_ID)}
                  onSelect={toggleSelectItem}
                  pointsRatio={pointsRatio}
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
              Search for items and add them to your catalog.
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
            pointsRatio={pointsRatio}
          />
        </div>
      )}
    </div>
  );
}