"use client";

import React, { useEffect, useState } from 'react';

const AboutPage = () => {
  const testData = {
    TeamNumber: "24",
    SprintNumber: "3",
    ReleaseDate: "2024-02-20",
    ProductName: "Good Driver Incentive Program",
    ProductDescription: "A web application for incentivizing and rewarding good driving behavior in the trucking industry."
  };

  const [aboutData, setAboutData] = useState(testData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Commented out API call for now
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/about', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch about data');
        }
        
        const data = await response.json();
        setAboutData(JSON.parse(data.body));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);
  */

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

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <p style={{ fontSize: '1.125rem', color: '#dc2626' }}>Error: {error}</p>
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