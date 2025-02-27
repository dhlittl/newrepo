'use client';

import ProductCatalog from '../components/ProductCatalog.js';
import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from '../../aws-exports';

// Configure Amplify
Amplify.configure(awsExports);

export default function iTunesTestPage() {
  // Log to confirm page rendering
  useEffect(() => {
    console.log('iTunes test page loaded');
    Amplify.configure(awsExports);
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">iTunes API Test</h1>
      <p className="mb-6">This page tests the integration with the iTunes API via AWS Lambda.</p>
      <ProductCatalog />
    </div>
  );
}