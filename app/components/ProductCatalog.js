'use client';

import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/api";

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch catalog from iTunes API via Lambda
  const fetchCatalog = async (term = 'top') => {
    setLoading(true);
    try {
      // Call the Lambda function via API Gateway
      const response = await API.post('iTunesAPI', '/products', {
        body: {
          operation: term === 'top' ? 'catalog' : 'search',
          searchTerm: term,
          mediaType: 'music',
          limit: 20
        }
      });
      
      console.log('API Response:', response);
      
      if (response.products) {
        setProducts(response.products);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load product catalog. Please try again later.');
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCatalog(searchTerm);
  };

  // Load initial catalog on component mount
  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">iTunes Product Catalog Test</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
        </div>
      </form>
      
      {/* Error Message */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Loading Spinner */}
      {loading && (
        <div className="text-center my-5">
          <p>Loading...</p>
        </div>
      )}
      
      {/* Product Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length === 0 ? (
            <div>
              <p>No products found. Try a different search term.</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="border rounded p-4 flex flex-col">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-40 object-contain mx-auto mb-3"
                  />
                )}
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.type}</p>
                <p className="mt-2">${product.price}</p>
                {product.description && (
                  <p className="mt-2 text-sm overflow-hidden">
                    {product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;