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
    
    // Normalize the results to a consistent count for pagination
    // The API returns variable counts, so we'll cap it at a consistent number
    const normalizedResults = data.results;
    const normalizedTotal = data.resultCount > apiLimit ? apiLimit : data.resultCount;
    
    // Calculate pagination on the server side
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    // Slice the exact number of results we want to return for this page
    const paginatedResults = normalizedResults.slice(startIndex, endIndex);
    
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