'use client';

import { useState, useEffect } from 'react';

export default function ITunesSearch() {
  const [searchTerm, setSearchTerm] = useState('jack johnson');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 10;

  const fetchResults = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/itunes?term=${encodeURIComponent(searchTerm)}&page=${page}&resultsPerPage=${resultsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setTotalResults(data.totalResults || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (error) {
      console.error('Error fetching iTunes data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      
      <form onSubmit={handleSearch} className="mb-6">
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

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, index) => {
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
                priceDisplay = `$${item.trackPrice}`;
              } else if (item.collectionPrice !== undefined) {
                priceDisplay = `$${item.collectionPrice}`;
              }

              return (
                <div key={uniqueKey} className="border rounded p-4 flex flex-col">
                  <div className="text-xs text-gray-500 mb-1">
                    {item.wrapperType || 'unknown type'}
                  </div>
                  <img 
                    src={item.artworkUrl100 || '/placeholder-image.jpg'} 
                    alt={displayName} 
                    className="w-24 h-24 object-cover mx-auto mb-2"
                  />
                  <h3 className="font-medium text-lg line-clamp-2">
                    {displayName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.artistName || 'Unknown Artist'}
                  </p>
                  <p className="mt-auto pt-2">
                    Price: {priceDisplay}
                  </p>
                </div>
              );
            })}
          </div>

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

          {results.length === 0 && !loading && (
            <p className="text-center">No results found. Try a different search term.</p>
          )}
        </>
      )}
    </div>
  );
}