const https = require('https');
const url = require('url');

exports.handler = async (event) => {
    try {
        // Extract operation from event
        const body = event.body ? JSON.parse(event.body) : event;
        const operation = body.operation;
        
        let apiUrl;
        
        if (operation === 'search') {
            // Get search parameters
            const searchTerm = body.searchTerm || 'top';
            const mediaType = body.mediaType || 'all';
            const limit = body.limit || 50;
            
            // Create search URL
            const params = new url.URLSearchParams({
                term: searchTerm,
                media: mediaType,
                limit: limit,
                country: 'US'
            });
            
            apiUrl = `https://itunes.apple.com/search?${params.toString()}`;
            
        } else if (operation === 'lookup') {
            // Get lookup ID
            const itemId = body.id || '';
            
            // Create lookup URL
            const params = new url.URLSearchParams({
                id: itemId,
                country: 'US'
            });
            
            apiUrl = `https://itunes.apple.com/lookup?${params.toString()}`;
            
        } else if (operation === 'catalog') {
            // Get catalog parameters
            const mediaType = body.mediaType || 'music';
            const limit = body.limit || 50;
            
            // Create catalog URL (get top items in category)
            const params = new url.URLSearchParams({
                term: 'top',
                media: mediaType,
                limit: limit,
                country: 'US'
            });
            
            apiUrl = `https://itunes.apple.com/search?${params.toString()}`;
            
        } else {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({error: 'Invalid operation. Use "search", "lookup", or "catalog".'})
            };
        }
        
        // Make request to iTunes API
        const data = await httpRequest(apiUrl);
        const jsonData = JSON.parse(data);
        
        // Process the data to extract relevant product information
        const products = jsonData.results.map(item => ({
            id: item.trackId || item.collectionId,
            name: item.trackName || item.collectionName,
            price: item.trackPrice || item.collectionPrice || item.price || 0,
            description: item.description || item.longDescription || '',
            image: item.artworkUrl100,
            availability: true,  // iTunes items are generally available if returned
            type: item.kind || item.wrapperType,
            originalData: item  // Including original data for any additional fields needed
        }));
        
        // Return processed products
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                totalResults: jsonData.resultCount,
                products: products
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        // Return error message
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

// Helper function to make HTTP requests
function httpRequest(apiUrl) {
    return new Promise((resolve, reject) => {
        https.get(apiUrl, (response) => {
            let data = '';
            
            // A chunk of data has been received
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            // The whole response has been received
            response.on('end', () => {
                resolve(data);
            });
            
        }).on("error", (error) => {
            reject(error);
        });
    });
}