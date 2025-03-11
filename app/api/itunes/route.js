// app/api/itunes/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term') || '';
  const requestedLimit = parseInt(searchParams.get('limit') || '50');
  const page = parseInt(searchParams.get('page') || '1');
  const resultsPerPage = parseInt(searchParams.get('resultsPerPage') || '10');
  
  // Get the filter parameters
  const media = searchParams.get('media');
  const entity = searchParams.get('entity');
  const sort = searchParams.get('sort');
  
  try {
    // Request more than we need to account for API inconsistency
    const apiLimit = Math.max(requestedLimit, 200); 
    
    // Build the base URL
    let itunesApiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=${apiLimit}`;
    
    // Add media type filter if provided
    if (media) {
      itunesApiUrl += `&media=${encodeURIComponent(media)}`;
    }
    
    // Add entity filter if provided
    if (entity) {
      itunesApiUrl += `&entity=${encodeURIComponent(entity)}`;
    }
    
    console.log(`Calling iTunes API: ${itunesApiUrl}`);
    
    const response = await fetch(itunesApiUrl);
    
    if (!response.ok) {
      throw new Error(`iTunes API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`iTunes API returned ${data.resultCount} results for term "${term}"`);
    
    // Get all results first
    let allResults = data.results || [];
    
    // Apply sorting on the server side if a sort option is specified
    if (sort && sort !== 'none') {
      console.log(`Applying server-side sorting: ${sort}`);
      
      allResults.sort((a, b) => {
        switch (sort) {
          case 'price-low-high':
            return (a.trackPrice || a.collectionPrice || 0) - (b.trackPrice || b.collectionPrice || 0);
          case 'price-high-low':
            return (b.trackPrice || b.collectionPrice || 0) - (a.trackPrice || a.collectionPrice || 0);
          case 'name-a-z':
            const nameA = a.trackName || a.collectionName || '';
            const nameB = b.trackName || b.collectionName || '';
            return nameA.localeCompare(nameB);
          case 'name-z-a':
            const nameADesc = a.trackName || a.collectionName || '';
            const nameBDesc = b.trackName || b.collectionName || '';
            return nameBDesc.localeCompare(nameADesc);
          case 'date-newest':
            const dateA = new Date(a.releaseDate || 0);
            const dateB = new Date(b.releaseDate || 0);
            return dateB - dateA;
          case 'date-oldest':
            const dateAOld = new Date(a.releaseDate || 0);
            const dateBOld = new Date(b.releaseDate || 0);
            return dateAOld - dateBOld;
          default:
            return 0;
        }
      });
    }
    
    // Normalize the results to a consistent count for pagination
    const normalizedTotal = allResults.length > apiLimit ? apiLimit : allResults.length;
    
    // Calculate pagination on the server side
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    // Slice the exact number of results we want to return for this page
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    return NextResponse.json({
      results: paginatedResults,
      totalResults: normalizedTotal,
      currentPage: page,
      totalPages: Math.ceil(normalizedTotal / resultsPerPage),
      resultsPerPage: resultsPerPage
    });
  } catch (error) {
    console.error('iTunes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from iTunes API' },
      { status: 500 }
    );
  }
}