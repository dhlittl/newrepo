// app/pages/sponsor/catalog/components/ITunesFilters.jsx
'use client';

import { useState, useEffect } from 'react';
import { MEDIA_TYPES, ENTITY_OPTIONS } from '@/constants/itunesMedia';

const ITunesFilters = ({ onFilterChange, onSortChange, currentFilters }) => {
  const [mediaType, setMediaType] = useState(currentFilters?.mediaType || 'all');
  const [entity, setEntity] = useState(currentFilters?.entity || '');
  const [sortBy, setSortBy] = useState('none');
  
  // Update local state when props change
  useEffect(() => {
    if (currentFilters) {
      setMediaType(currentFilters.mediaType || 'all');
      setEntity(currentFilters.entity || '');
    }
  }, [currentFilters]);

  const handleMediaTypeChange = (e) => {
    const value = e.target.value;
    setMediaType(value);
    onFilterChange('mediaType', value);
  };

  const handleEntityChange = (e) => {
    const value = e.target.value;
    setEntity(value);
    onFilterChange('entity', value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  // Get entity options for current media type
  const entityOptions = ENTITY_OPTIONS[mediaType] || [];

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-1">
            Media Type
          </label>
          <select
            id="mediaType"
            value={mediaType}
            onChange={handleMediaTypeChange}
            className="w-full p-2 border rounded-md"
          >
            {MEDIA_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {entityOptions.length > 0 && (
          <div>
            <label htmlFor="entity" className="block text-sm font-medium text-gray-700 mb-1">
              Entity
            </label>
            <select
              id="entity"
              value={entity}
              onChange={handleEntityChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Any</option>
              {entityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="none">Default</option>
            <option value="price-low-high">Price (Low to High)</option>
            <option value="price-high-low">Price (High to Low)</option>
            <option value="name-a-z">Name (A to Z)</option>
            <option value="name-z-a">Name (Z to A)</option>
            <option value="date-newest">Release Date (Newest First)</option>
            <option value="date-oldest">Release Date (Oldest First)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ITunesFilters;