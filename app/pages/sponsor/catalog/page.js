// app/pages/sponsor/catalog/page.js
"use client";

import { useState, useEffect } from 'react';
import SponsorCatalog from './SponsorCatalog';
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// Component for test/development environment only
const TestSponsorSelector = ({ onSelectSponsor }) => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  
  // Fetch available sponsors for testing
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch('https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsors: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSponsors(data || []);
      } catch (err) {
        console.error('Error fetching sponsors:', err);
        setError(`Failed to fetch sponsors: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSponsors();
  }, []);

  // Create a temporary test sponsor
  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    
    if (!newSponsorName.trim()) {
      alert('Please enter a sponsor name');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock creating a sponsor for testing
      const mockSponsorId = Math.floor(Math.random() * 1000) + 1;
      
      // Add to sponsor list
      const newSponsor = {
        Sponsor_Org_ID: mockSponsorId,
        Sponsor_Org_Name: newSponsorName,
        isTemporary: true
      };
      
      setSponsors(prev => [...prev, newSponsor]);
      setShowCreateForm(false);
      onSelectSponsor(mockSponsorId, newSponsorName, true);
      
      alert(`Test sponsor created with ID: ${mockSponsorId}`);
    } catch (err) {
      alert(`Error creating sponsor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading sponsors...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-lg mx-auto mb-8 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Testing Controls</h2>
      
      <div>
        <p className="mb-3">Select a sponsor to test with:</p>
        
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
          <select 
            className="p-2 border rounded"
            onChange={(e) => {
              const id = parseInt(e.target.value);
              if (id) {
                const sponsor = sponsors.find(s => s.Sponsor_Org_ID === id);
                onSelectSponsor(id, sponsor.Sponsor_Org_Name, sponsor.isTemporary);
              }
            }}
            defaultValue=""
          >
            <option value="">-- Select a Sponsor --</option>
            {sponsors.map(sponsor => (
              <option key={sponsor.Sponsor_Org_ID} value={sponsor.Sponsor_Org_ID}>
                {sponsor.Sponsor_Org_Name} (ID: {sponsor.Sponsor_Org_ID})
                {sponsor.isTemporary ? ' - Temporary' : ''}
              </option>
            ))}
          </select>
          
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Test Sponsor'}
          </button>
        </div>
        
        {showCreateForm && (
          <form onSubmit={handleCreateSponsor} className="mb-4 p-3 border rounded bg-white">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Sponsor Name</label>
              <input
                type="text"
                value={newSponsorName}
                onChange={(e) => setNewSponsorName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter sponsor name"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Sponsor'}
            </button>
          </form>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <p><strong>Note:</strong> This testing UI should be removed in production.</p>
      </div>
    </div>
  );
};

export default function CatalogPage() {
  const [sponsorId, setSponsorId] = useState(null);
  const [sponsorName, setSponsorName] = useState('');
  const [isTemporary, setIsTemporary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For production: fetch sponsor ID from authenticated user
  const fetchSponsorFromUser = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      const sponsorId = session.tokens?.idToken?.payload['custom:sponsorOrgId'];
      if (sponsorId) {
        setSponsorId(parseInt(sponsorId));
        // You'd also want to fetch sponsor name here
        setSponsorName("Your Organization");
        setIsTemporary(false);
      } else {
        throw new Error("Sponsor ID not found in user attributes.");
      }
    } catch (err) {
      console.error("Error fetching sponsor ID:", err);
      setError("Failed to fetch sponsor ID. Using test mode instead.");
    } finally {
      setLoading(false);
    }
  };
  
  // Uncomment for production
  // useEffect(() => {
  //   fetchSponsorFromUser();
  // }, []);
  
  // Delete a temporary sponsor (for testing only)
  const handleDeleteTemporarySponsor = () => {
    if (confirm('Are you sure you want to delete the temporary sponsor?')) {
      setSponsorId(null);
      setSponsorName('');
      setIsTemporary(false);
    }
  };
  
  // Select a sponsor for testing
  const handleSelectSponsor = (id, name, temporary = false) => {
    setSponsorId(id);
    setSponsorName(name);
    setIsTemporary(temporary);
  };

  // For testing, set loading to false
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sponsor Product Catalog</h1>
      
      {/* TESTING UI - Remove in production */}
      {!sponsorId ? (
        <TestSponsorSelector onSelectSponsor={handleSelectSponsor} />
      ) : (
        <div className="max-w-lg mx-auto mb-8 p-4 bg-gray-100 rounded-lg">
          <div>
            <p className="mb-2">
              <span className="font-medium">Currently using: </span>
              {sponsorName} (ID: {sponsorId})
            </p>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setSponsorId(null)}
              >
                Change Sponsor
              </button>
              
              {isTemporary && (
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteTemporarySponsor}
                >
                  Delete Temporary Sponsor
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {sponsorId ? (
        <SponsorCatalog sponsorId={sponsorId} />
      ) : (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded">
          Please select or create a sponsor to view the catalog.
        </div>
      )}
    </main>
  );
}