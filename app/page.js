"use client";

import React, { useEffect, useState } from 'react';

const AboutPage = () => {
  const [aboutData, setAboutData] = useState({
    TeamNumber: '',
    SprintNumber: '',
    ReleaseDate: '',
    ProductName: '',
    ProductDescription: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      console.log('Fetching about data...');
      try {
        const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/about', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch about data');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        // Check if we have a body property that needs parsing
        const parsedData = data.body ? JSON.parse(data.body) : data;
        
        // Validate that we have all required fields
        if (!parsedData.TeamNumber || !parsedData.SprintNumber || !parsedData.ReleaseDate || 
            !parsedData.ProductName || !parsedData.ProductDescription) {
          throw new Error('Missing required fields in response');
        }
        
        setAboutData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="border-b p-6">
          <h1 className="text-2xl font-bold text-center text-black">About Our Project</h1>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Team Number</h3>
              <p className="mt-1 text-gray-600">{aboutData.TeamNumber}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Version/Sprint Number</h3>
              <p className="mt-1 text-gray-600">{aboutData.SprintNumber}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Release Date</h3>
              <p className="mt-1 text-gray-600">{aboutData.ReleaseDate}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Product Name</h3>
              <p className="mt-1 text-gray-600">{aboutData.ProductName}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700">Product Description</h3>
              <p className="mt-1 text-gray-600">{aboutData.ProductDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;