// utils/catalog.js - Common utility functions for catalog components

export const calculatePointPrice = (dollarPrice, pointsRatio = 100) => {
    if (dollarPrice === null || dollarPrice === undefined || isNaN(parseFloat(dollarPrice))) {
      return null;
    }
    return Math.ceil(parseFloat(dollarPrice) * pointsRatio);
  };
  
  export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  export const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  export const getDisplayName = (item) => {
    return item.trackName || item.collectionName || item.Product_Name || 'Unknown Item';
  };
  
  export const getDollarPrice = (item) => {
    if (item.trackPrice !== undefined) return item.trackPrice;
    if (item.collectionPrice !== undefined) return item.collectionPrice;
    if (item.Price !== undefined) return parseFloat(item.Price);
    return null;
  };
  
  export const formatPriceDisplay = (price) => {
    if (price === null || price === undefined) return 'Not available';
    return `$${typeof price === 'string' ? parseFloat(price).toFixed(2) : price.toFixed(2)}`;
  };
  
  export const getMediaTypeDisplay = (item) => {
    let mediaTypeDisplay = item.wrapperType || 'unknown type';
    if (item.wrapperType === 'track' && item.kind) {
      mediaTypeDisplay = item.kind;
    }
    return mediaTypeDisplay;
  };