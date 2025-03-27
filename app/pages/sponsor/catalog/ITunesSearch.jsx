// app/pages/sponsor/catalog/ITunesSearch.jsx
'use client';

import { useState, useEffect } from 'react';
import ITunesFilters from './components/ITunesFilters';
import ItemDetail from './components/ItemDetail';
import ItemCard from '@/components/catalog/ItemCard';

export default function ITunesSearch({ onAddToCatalog, pointsRatio = 100, catalogItems = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    mediaType: 'all',
    entity: ''
  });
  const [sortOrder, setSortOrder] = useState('none');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const resultsPerPage = 10;

  const fetchResults = async (page = 1, retryForEmptyResults = true) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Request more results per page to account for already added items
      const requestLimit = resultsPerPage * 2;
      
      let apiUrl = `/api/itunes?term=${encodeURIComponent(searchTerm)}&page=${page}&resultsPerPage=${requestLimit}`;
      
      // Add filters to URL
      if (filters.mediaType !== 'all') {
        apiUrl += `&media=${filters.mediaType}`;
      }
      
      if (filters.entity) {
        apiUrl += `&entity=${filters.entity}`;
      }
      
      if (sortOrder !== 'none') {
        apiUrl += `&sort=${sortOrder}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update results but don't update filtered results yet - we'll do that in useEffect
      setResults(data.results || []);
      setTotalResults(data.totalResults || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      
      // If all results on this page are already in the catalog,
      // and we have more pages, automatically fetch the next page
      const filteredResults = (data.results || []).filter(item => {
        const itemName = item.trackName || item.collectionName || '';
        return !catalogItems.some(catalogItem => 
          catalogItem.Product_Name.toLowerCase() === itemName.toLowerCase()
        );
      });
      
      // If after filtering we have no results but there are more pages and we're allowed to retry
      if (filteredResults.length === 0 && page < data.totalPages && retryForEmptyResults) {
        // Fetch the next page
        return fetchResults(page + 1, retryForEmptyResults);
      }
      
      setFilteredResults(filteredResults);
    } catch (error) {
      console.error('Error fetching iTunes data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered results when results or catalogItems change
  useEffect(() => {
    // Filter out items that are already in the catalog or have been added in this session
    const filteredResults = results.filter(item => {
      const itemId = item.trackId || item.collectionId;
      
      // Check if this item has been marked as added
      if (addedItems[itemId]) {
        return false;
      }
      
      // Check if this item exists in the catalog
      const alreadyInCatalog = catalogItems.some(catalogItem => {
        // Look for catalog items with matching names
        const itemName = item.trackName || item.collectionName || '';
        return catalogItem.Product_Name.toLowerCase() === itemName.toLowerCase();
      });
      
      return !alreadyInCatalog;
    });
    
    setFilteredResults(filteredResults);
    
    // If after filtering we have very few results but there are more pages available,
    // automatically fetch the next page to maintain a good user experience
    if (filteredResults.length < 3 && currentPage < totalPages && hasSearched && searchTerm) {
      // We use a timeout to avoid potential infinite loops and to make sure
      // the UI updates first with what we have
      const timer = setTimeout(() => {
        fetchResults(currentPage + 1, false); // Don't recursively retry to avoid potential issues
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [results, catalogItems, addedItems, currentPage, totalPages, hasSearched, searchTerm]);
  
  // Function to handle selecting items for bulk add
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  // Function to handle bulk add
  const handleBulkAdd = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to add');
      return;
    }
    
    // Find the items corresponding to the selected IDs
    const itemsToAdd = filteredResults.filter(item => {
      const itemId = item.trackId || item.collectionId;
      return selectedItems.includes(itemId);
    });
    
    // Add each item to the catalog
    let successCount = 0;
    const newAddedItems = {...addedItems};
    
    itemsToAdd.forEach(item => {
      try {
        onAddToCatalog(item);
        
        // Mark this item as added
        const itemId = item.trackId || item.collectionId;
        newAddedItems[itemId] = true;
        
        successCount++;
      } catch (err) {
        console.error(`Error adding item ${item.trackName || item.collectionName}:`, err);
      }
    });
    
    // Update the added items state
    setAddedItems(newAddedItems);
    
    // Clear selection
    setSelectedItems([]);
    
    // Show success message
    alert(`${successCount} item${successCount !== 1 ? 's' : ''} added successfully!`);
    
    // If we've added all items on the current page, refresh results to pull in new items
    if (successCount === filteredResults.length && searchTerm) {
      fetchResults(currentPage);
    }
  };
  
  // Function to mark an individual item as added
  const handleItemAdded = (itemId) => {
    setAddedItems(prev => ({
      ...prev,
      [itemId]: true
    }));
    
    // If this was the last visible item on the page, refresh to get next set of results
    if (filteredResults.length === 1 && searchTerm) {
      fetchResults(currentPage);
    } else if (filteredResults.length <= 3 && searchTerm) {
      // If we're getting low on items on the current page, refresh to ensure page stays full
      fetchResults(currentPage);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Don't search if search term is empty
    if (!searchTerm.trim()) {
      return;
    }
    // Reset to first page on new search
    fetchResults(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    // Create updated filter state
    let updatedFilters;
    
    if (filterType === 'mediaType') {
      // If the media type changes, reset entity to empty
      updatedFilters = {
        ...filters,
        [filterType]: value,
        entity: '' // Reset entity when media type changes
      };
    } else {
      updatedFilters = {
        ...filters,
        [filterType]: value
      };
    }
    
    // Update the filter state
    setFilters(updatedFilters);
    
    // If it's a filter that affects the API call, refetch data immediately
    if ((filterType === 'mediaType' || filterType === 'entity') && hasSearched && searchTerm.trim()) {
      // Reset to page 1 when filters change and use enhanced fetch with retry
      setFilters(updatedFilters); // Ensure filters are updated before fetch
      
      // Clear selected items when changing filters
      setSelectedItems([]);
      
      // Fetch with delay to ensure state is updated
      setTimeout(() => {
        fetchResults(1, true);
      }, 10);
    }
  };

  // Handle sort changes
  const handleSortChange = (sortValue) => {
    setSortOrder(sortValue);
    
    // If we have results and a search has been performed, refetch with the new sort order
    if (hasSearched && searchTerm.trim()) {
      // Reset to page 1 when sorting changes and use enhanced fetch
      fetchResults(1, true);
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      fetchResults(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      fetchResults(currentPage - 1);
    }
  };

  // Format the current filter description
  const getFilterDescription = () => {
    if (filters.mediaType === 'all' && !filters.entity) {
      return '';
    }
    
    let description = ' for ';
    
    if (filters.mediaType !== 'all') {
      description += filters.mediaType;
    }
    
    if (filters.entity) {
      description += ` (${filters.entity})`;
    }
    
    return description;
  };

  // Select all items for bulk actions
  const handleSelectAll = (select) => {
    if (select) {
      // Get all item IDs
      const allIds = filteredResults.map(item => item.trackId || item.collectionId);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search iTunes..."
            className="flex-grow p-2 border rounded"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-600">
        <p>Point conversion rate: {pointsRatio} points = $1.00</p>
      </div>
      
      {/* Bulk actions */}
      <div className="mb-4 bg-gray-50 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedItems.length > 0 && selectedItems.length === filteredResults.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="text-sm font-medium">
            {selectedItems.length > 0 
              ? `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected` 
              : 'Select All'}
          </span>
        </div>
        
        <button
          onClick={handleBulkAdd}
          disabled={selectedItems.length === 0}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded disabled:opacity-50"
        >
          Add Selected Items
        </button>
      </div>

      <ITunesFilters 
        onFilterChange={handleFilterChange} 
        onSortChange={handleSortChange}
        currentFilters={filters}
      />

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          {filteredResults.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
                {getFilterDescription()}
                {sortOrder !== 'none' && ` sorted by: ${sortOrder}`}
              </p>
            </div>
          ) : hasSearched ? (
            <p className="text-center p-4 bg-gray-50 rounded-lg mb-4">
              No results found for "{searchTerm}". Try different search terms or filters.
            </p>
          ) : (
            <p className="text-center p-4 bg-gray-50 rounded-lg mb-4">
              Enter a search term above to find iTunes products.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((item, index) => {
              // Get a unique identifier for this item
              const itemId = item.trackId || item.collectionId;
              const isItemAdded = addedItems[itemId] || false;
              
              return (
                <ItemCard 
                  key={itemId || `${item.artistId}-${item.collectionName}-${index}`}
                  item={item}
                  onAddToCatalog={(item) => {
                    onAddToCatalog(item);
                    handleItemAdded(itemId);
                  }}
                  onSelect={handleSelectItem}
                  onViewDetails={setSelectedItem}
                  isSelected={selectedItems.includes(itemId)}
                  isAdded={isItemAdded}
                  pointsRatio={pointsRatio}
                />
              );
            })}
          </div>

          {filteredResults.length === 0 && !loading && hasSearched && (
            <p className="text-center p-8 bg-gray-50 rounded-lg">
              No results match your current filters. Try changing your filters or search term.
            </p>
          )}

          {results.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <p>
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'
                  }`}
                >
                  &larr; Previous
                </button>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'
                  }`}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {selectedItem && (
        <ItemDetail 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCatalog={onAddToCatalog}
          pointsRatio={pointsRatio}
        />
      )}
    </div>
  );
}