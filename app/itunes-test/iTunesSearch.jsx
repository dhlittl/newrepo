'use client';

import { useState, useEffect } from 'react';
import ITunesFilters from './components/ITunesFilters';
import ItemDetail from './components/ItemDetail';

export default function ITunesSearch() {
  const [searchTerm, setSearchTerm] = useState('jack johnson');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    mediaType: 'all'
  });
  const [sortOrder, setSortOrder] = useState('none');
  const [selectedItem, setSelectedItem] = useState(null);
  const resultsPerPage = 10;

  const fetchResults = async (page = 1) => {
    setLoading(true);
    try {
      let apiUrl = `/api/itunes?term=${encodeURIComponent(searchTerm)}&page=${page}&resultsPerPage=${resultsPerPage}`;
      
      // Add media type filter if not 'all'
      if (filters.mediaType !== 'all') {
        apiUrl += `&media=${filters.mediaType}`;
      }
      
      // Add entity filter if specified
      if (filters.entity) {
        apiUrl += `&entity=${filters.entity}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setFilteredResults(data.results || []);
      setTotalResults(data.totalResults || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching iTunes data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to results
  useEffect(() => {
    let filtered = [...results];
    
    // Apply sorting
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        switch (sortOrder) {
          case 'price-low-high':
            return (a.trackPrice || a.collectionPrice || 0) - (b.trackPrice || b.collectionPrice || 0);
          case 'price-high-low':
            return (b.trackPrice || b.collectionPrice || 0) - (a.trackPrice || a.collectionPrice || 0);
          case 'name-a-z':
            const nameA = a.trackName || a.collectionName || '';
            const nameB = b.trackName || b.collectionName || '';
            return nameA.localeCompare(nameB);
          case 'name-z-a':
            const nameADesc = a.trackName || a.collectionName || '';
            const nameBDesc = b.trackName || b.collectionName || '';
            return nameBDesc.localeCompare(nameADesc);
          case 'date-newest':
            const dateA = new Date(a.releaseDate || 0);
            const dateB = new Date(b.releaseDate || 0);
            return dateB - dateA;
          case 'date-oldest':
            const dateAOld = new Date(a.releaseDate || 0);
            const dateBOld = new Date(b.releaseDate || 0);
            return dateAOld - dateBOld;
          default:
            return 0;
        }
      });
    }
    
    setFilteredResults(filtered);
  }, [results, sortOrder]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page on new search
    fetchResults(1);
  };

  // Initialize with default search
  useEffect(() => {
    fetchResults(1);
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // If it's a filter that affects the API call, refetch data
    if (filterType === 'mediaType' || filterType === 'entity') {
      fetchResults(1);
    }
  };

  // Handle sort changes
  const handleSortChange = (sortValue) => {
    setSortOrder(sortValue);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">iTunes Search</h1>
      
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

      <ITunesFilters 
        onFilterChange={handleFilterChange} 
        onSortChange={handleSortChange} 
      />

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
              {filters.mediaType !== 'all' && ` for ${filters.mediaType}`}
              {filters.entity && ` (${filters.entity})`}
              {sortOrder !== 'none' && ` sorted by: ${sortOrder}`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((item, index) => {
              // Create a deterministic unique key based on multiple properties
              const uniqueKey = item.trackId || 
                                item.collectionId || 
                                `${item.artistId}-${item.collectionName}-${index}`;
              
              // Determine the name to display
              let displayName = 'Unknown Item';
              if (item.trackName) {
                displayName = item.trackName;
              } else if (item.collectionName) {
                displayName = item.collectionName;
              }

              // Determine the price to display
              let priceDisplay = 'Not available';
              if (item.trackPrice !== undefined) {
                priceDisplay = `${item.trackPrice}`;
              } else if (item.collectionPrice !== undefined) {
                priceDisplay = `${item.collectionPrice}`;
              }

              // Determine the media type display
              let mediaTypeDisplay = item.wrapperType || 'unknown type';
              if (item.wrapperType === 'track' && item.kind) {
                mediaTypeDisplay = item.kind;
              }

              // Format release date
              let releaseDate = '';
              if (item.releaseDate) {
                releaseDate = new Date(item.releaseDate).toLocaleDateString();
              }

              return (
                <div 
                  key={uniqueKey} 
                  className="border rounded p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="text-xs text-gray-500 mb-1 bg-gray-100 px-2 py-1 rounded-full inline-block self-start">
                    {mediaTypeDisplay}
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
                    <p className="font-bold text-blue-600">
                      {priceDisplay}
                    </p>
                    {releaseDate && (
                      <p className="text-xs text-gray-500">
                        Released: {releaseDate}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredResults.length === 0 && !loading && (
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
        />
      )}
    </div>
  );
}