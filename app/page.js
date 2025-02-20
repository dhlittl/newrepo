"use client";

import React, { useEffect, useState } from 'react';

const AboutPage = () => {
  // Fallback test data in case API call fails
  const testData = {
    TeamNumber: "24",
    SprintNumber: "3",
    ReleaseDate: "2024-02-20",
    ProductName: "Good Driver Incentive Program",
    ProductDescription: "A web application for incentivizing and rewarding good driving behavior in the trucking industry."
  };

  const [aboutData, setAboutData] = useState(testData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/about', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Remove any credentials or origin headers - let API Gateway handle CORS
          },
          // Don't send credentials
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.body) {
          try {
            const parsedData = JSON.parse(data.body);
            setAboutData(parsedData);
          } catch (parseError) {
            console.error('Error parsing response data:', parseError);
            // Fallback to test data if parsing fails
            setAboutData(testData);
          }
        } else {
          // Fallback to test data if response format is unexpected
          console.error('Unexpected response format:', data);
          setAboutData(testData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        // Fallback to test data on error
        setAboutData(testData);
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <p style={{ fontSize: '1.125rem', color: '#000000' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      <div style={{ 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}
        <h1 style={{ 
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#000000'
        }}>
          About Our Project
        </h1>
        
        <div style={{ 
          display: 'grid',
          gap: '1.5rem',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <InfoSection title="Team Number" content={aboutData.TeamNumber} />
          <InfoSection title="Version/Sprint Number" content={aboutData.SprintNumber} />
          <InfoSection title="Release Date" content={aboutData.ReleaseDate} />
          <InfoSection title="Product Name" content={aboutData.ProductName} />
          <InfoSection title="Product Description" content={aboutData.ProductDescription} />
        </div>
      </div>
    </div>
  );
};

const InfoSection = ({ title, content }) => (
  <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
    <h3 style={{ 
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#000000',
      marginBottom: '0.5rem'
    }}>
      {title}
    </h3>
    <p style={{ 
      color: '#333333',
      lineHeight: '1.5'
    }}>
      {content}
    </p>
  </div>
);

export default AboutPage;