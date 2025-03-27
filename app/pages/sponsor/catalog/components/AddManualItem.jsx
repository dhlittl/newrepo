// app/pages/sponsor/catalog/components/AddManualItem.jsx

'use client';

import { useState } from 'react';

const AddManualItem = ({ sponsorId, onItemAdded, pointsRatio = 100, setFeatured = false }) => {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    price: '',
    quantity: '1',
    imageUrl: '',
    featured: setFeatured
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Calculate the equivalent point value
  const pointValue = formData.price.trim() && !isNaN(parseFloat(formData.price)) 
    ? Math.ceil(parseFloat(formData.price) * pointsRatio) 
    : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user makes a change
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number greater than or equal to 0';
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be a valid number greater than 0';
    }
    
    if (formData.imageUrl.trim() && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // TEMPORARY DEBUG CODE
      console.log('Adding manual item:');
      console.log('API endpoint:', 'https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog');
      console.log('Request payload:', {
        sponsorId: sponsorId,
        productName: formData.productName,
        productDescription: formData.productDescription,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        imageUrl: formData.imageUrl,
        featured: formData.featured
      });
      
      const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorId: sponsorId,
          productName: formData.productName,
          productDescription: formData.productDescription,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          imageUrl: formData.imageUrl,
          featured: formData.featured
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error adding item: ${response.statusText}`);
      }
      
      // Reset form
      setFormData({
        productName: '',
        productDescription: '',
        price: '',
        quantity: '1',
        imageUrl: '',
        featured: setFeatured
      });
      
      // Notify parent component
      onItemAdded();
      
      alert('Item added to catalog successfully!');
    } catch (err) {
      console.error('Error adding item to catalog:', err);
      
      // TEMPORARY TESTING CODE - Handle connection errors gracefully
      if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        alert('Could not connect to the catalog API. This is expected during testing if the Lambda function is not fully configured. The UI will continue as if the item was added.');
        
        // Reset form
        setFormData({
          productName: '',
          productDescription: '',
          price: '',
          quantity: '1',
          imageUrl: '',
          featured: setFeatured
        });
        
        // Notify parent component to simulate success
        onItemAdded();
      } else {
        alert(`Error adding item: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-medium mb-4">Add New Product</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.productName && (
              <p className="mt-1 text-sm text-red-500">{errors.productName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="productDescription"
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Dollar Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full p-2 pl-6 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
              
              {pointValue > 0 && (
                <div className="mt-1 text-sm text-green-600 font-medium">
                  Equivalent to {pointValue.toLocaleString()} points
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Conversion Rate: ${(1/pointsRatio).toFixed(2)} per point ({pointsRatio} points = $1.00)
              </p>
            </div>
            
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full p-2 border rounded-md ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={`w-full p-2 border rounded-md ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Leave blank if no image is available</p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Mark as featured product
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => onItemAdded()} // Just cancel and return to catalog
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddManualItem;