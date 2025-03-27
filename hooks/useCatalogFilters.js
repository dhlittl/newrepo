// hooks/useCatalogFilters.js - Custom hook for filtering and sorting catalog items
import { useState, useMemo } from 'react';

export function useCatalogFilters(items) {
  const [filterOption, setFilterOption] = useState('all'); // 'all', 'featured', 'regular'
  const [sortOption, setSortOption] = useState('default'); // 'default', 'price-asc', etc.
  
  // Apply filters and sorting
  const processedItems = useMemo(() => {
    // First, filter the items
    const filtered = items.filter(item => {
      if (filterOption === 'all') return true;
      if (filterOption === 'featured') return item.Featured;
      if (filterOption === 'regular') return !item.Featured;
      return true;
    });
    
    // Then, sort the filtered items
    return [...filtered].sort((a, b) => {
      if (sortOption === 'price-asc') {
        return parseFloat(a.Price) - parseFloat(b.Price);
      } else if (sortOption === 'price-desc') {
        return parseFloat(b.Price) - parseFloat(a.Price);
      } else if (sortOption === 'name-asc') {
        return a.Product_Name.localeCompare(b.Product_Name);
      } else if (sortOption === 'name-desc') {
        return b.Product_Name.localeCompare(a.Product_Name);
      } else if (sortOption === 'date-asc') {
        return new Date(a.Created_At) - new Date(b.Created_At);
      } else if (sortOption === 'date-desc') {
        return new Date(b.Created_At) - new Date(a.Created_At);
      } else {
        // Default sort: Featured first, then by date (newest first)
        if (a.Featured && !b.Featured) return -1;
        if (!a.Featured && b.Featured) return 1;
        return new Date(b.Created_At) - new Date(a.Created_At);
      }
    });
  }, [items, filterOption, sortOption]);
  
  return {
    filteredItems: processedItems,
    filterOption,
    setFilterOption,
    sortOption,
    setSortOption
  };
}