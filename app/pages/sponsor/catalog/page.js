// app/pages/sponsor/catalog/page.js

"use client";
import { useState, useEffect } from 'react';
import SponsorCatalog from './SponsorCatalog';
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export default function CatalogPage() {
  // Original code - commented out for testing
  /*
  const [sponsorId, setSponsorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sponsor ID from the authenticated user
  useEffect(() => {
    const getSponsorIdFromUser = async () => {
      try {
        const user = await getCurrentUser(); // Fetch authenticated user
        const session = await fetchAuthSession(); // Fetch session tokens
  
        // Check ID token payload for custom attributes
        const sponsorId = session.tokens?.idToken?.payload['custom:sponsorOrgId'];
        if (sponsorId) {
          setSponsorId(sponsorId);
        } else {
          throw new Error("Sponsor ID not found in user attributes.");
        }
      } catch (err) {
        console.error("Error fetching sponsor ID:", err);
        setError("Failed to fetch sponsor ID.");
      } finally {
        setLoading(false);
      }
    };
  
    getSponsorIdFromUser();
  }, []);
  */

  // TEMPORARY TESTING CODE - REMOVE AFTER IMPLEMENTATION
  const [sponsorId, setSponsorId] = useState(null);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [createdSponsorId, setCreatedSponsorId] = useState(null);

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

  // Handle creating a dummy sponsor for testing
  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    
    if (!newSponsorName.trim()) {
      alert('Please enter a sponsor name');
      return;
    }
    
    setLoading(true);
    
    try {
      // This is a simplified version - in a real app you'd call your API
      // Just mocking this functionality for testing
      console.log(`Creating test sponsor: ${newSponsorName}`);
      
      // Instead of actually creating a sponsor, we'll just pretend we did for testing
      const mockSponsorId = Math.floor(Math.random() * 1000) + 1;
      setCreatedSponsorId(mockSponsorId);
      setSponsorId(mockSponsorId);
      setShowCreateForm(false);
      
      // Add the new sponsor to the list
      setSponsors([...sponsors, {
        Sponsor_Org_ID: mockSponsorId,
        Sponsor_Org_Name: newSponsorName,
        isTemporary: true
      }]);
      
      alert(`Test sponsor created with ID: ${mockSponsorId}`);
    } catch (err) {
      console.error('Error creating sponsor:', err);
      alert(`Error creating sponsor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a sponsor from the dropdown
  const handleSelectSponsor = (e) => {
    const selectedId = parseInt(e.target.value);
    setSponsorId(selectedId);
  };

  // Handle deleting a temporary sponsor
  const handleDeleteSponsor = () => {
    if (!createdSponsorId) return;
    
    if (confirm('Are you sure you want to delete the temporary sponsor?')) {
      console.log(`Deleting temporary sponsor ID: ${createdSponsorId}`);
      
      // Remove from the list
      setSponsors(sponsors.filter(s => s.Sponsor_Org_ID !== createdSponsorId));
      
      // Reset states
      setCreatedSponsorId(null);
      setSponsorId(null);
      
      alert('Temporary sponsor deleted');
    }
  };
  // END TEMPORARY TESTING CODE

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sponsor Product Catalog</h1>
      
      {/* TEMPORARY TESTING UI - REMOVE AFTER IMPLEMENTATION */}
      <div className="max-w-lg mx-auto mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Testing Controls</h2>
        
        {!sponsorId ? (
          <div>
            <p className="mb-3">Select a sponsor to test with:</p>
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
              <select 
                className="p-2 border rounded"
                onChange={handleSelectSponsor}
                value={sponsorId || ''}
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
        ) : (
          <div>
            <p className="mb-2">
              <span className="font-medium">Currently testing with: </span>
              {sponsors.find(s => s.Sponsor_Org_ID === sponsorId)?.Sponsor_Org_Name} (ID: {sponsorId})
            </p>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setSponsorId(null)}
              >
                Change Sponsor
              </button>
              
              {createdSponsorId === sponsorId && (
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleDeleteSponsor}
                >
                  Delete Temporary Sponsor
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          <p><strong>Note:</strong> This testing UI should be removed in production.</p>
        </div>
      </div>
      {/* END TEMPORARY TESTING UI */}
      
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