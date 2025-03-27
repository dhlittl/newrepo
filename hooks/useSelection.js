// hooks/useSelection.js - Custom hook for managing item selection
import { useState } from 'react';

export function useSelection() {
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Toggle selection status of an item
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  // Select or deselect all items in a given set
  const handleSelectAll = (items, select) => {
    if (select) {
      // Get all item IDs
      const allIds = items.map(item => item.Product_ID);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };
  
  // Clear all selections
  const clearSelection = () => {
    setSelectedItems([]);
  };
  
  return {
    selectedItems,
    toggleSelectItem,
    handleSelectAll,
    clearSelection
  };
}