// app/itunes-test/components/ITunesFilters.jsx

'use client';

import { useState, useEffect } from 'react';

const ITunesFilters = ({ onFilterChange, onSortChange, currentFilters }) => {
  const [mediaType, setMediaType] = useState(currentFilters?.mediaType || 'all');
  const [entity, setEntity] = useState(currentFilters?.entity || '');
  const [sortBy, setSortBy] = useState('none');
  const [entityOptions, setEntityOptions] = useState([]);

  // Update local state when props change
  useEffect(() => {
    if (currentFilters) {
      setMediaType(currentFilters.mediaType || 'all');
      setEntity(currentFilters.entity || '');
    }
  }, [currentFilters]);

  // Define entity options based on selected media type
  useEffect(() => {
    let options = [];
    
    switch(mediaType) {
      case 'movie':
        options = [
          { value: 'movieArtist', label: 'Movie Artist' },
          { value: 'movie', label: 'Movie' }
        ];
        break;
      case 'podcast':
        options = [
          { value: 'podcastAuthor', label: 'Podcast Author' },
          { value: 'podcast', label: 'Podcast' }
        ];
        break;
      case 'music':
        options = [
          { value: 'musicArtist', label: 'Music Artist' },
          { value: 'musicTrack', label: 'Song' },
          { value: 'album', label: 'Album' },
          { value: 'musicVideo', label: 'Music Video' },
          { value: 'mix', label: 'Mix' }
        ];
        break;
      case 'audiobook':
        options = [
          { value: 'audiobookAuthor', label: 'Audiobook Author' },
          { value: 'audiobook', label: 'Audiobook' }
        ];
        break;
      case 'tvShow':
        options = [
          { value: 'tvEpisode', label: 'TV Episode' },
          { value: 'tvSeason', label: 'TV Season' }
        ];
        break;
      case 'software':
        options = [
          { value: 'software', label: 'Software' },
          { value: 'iPadSoftware', label: 'iPad App' },
          { value: 'macSoftware', label: 'Mac App' }
        ];
        break;
      case 'ebook':
        options = [
          { value: 'ebook', label: 'eBook' }
        ];
        break;
      default:
        options = [];
    }
    
    setEntityOptions(options);
  }, [mediaType]);

  const handleMediaTypeChange = (e) => {
    const value = e.target.value;
    setMediaType(value);
    // We'll let the parent component handle the entity reset
    // Trigger the filter change immediately
    onFilterChange('mediaType', value);
  };

  const handleEntityChange = (e) => {
    const value = e.target.value;
    setEntity(value);
    // Trigger the filter change immediately
    onFilterChange('entity', value);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSortChange(value);
  };

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
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="podcast">Podcasts</option>
            <option value="music">Music</option>
            <option value="musicVideo">Music Videos</option>
            <option value="audiobook">Audiobooks</option>
            <option value="shortFilm">Short Films</option>
            <option value="tvShow">TV Shows</option>
            <option value="software">Software</option>
            <option value="ebook">eBooks</option>
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