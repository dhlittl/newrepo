// app/pages/sponsor/catalog/page.js

"use client";
import { useState } from 'react';
import SponsorCatalog from './SponsorCatalog';
import { useEffectiveSponsorId } from '@/hooks/useEffectiveSponsorId';

export default function CatalogPage() {
  const { sponsorOrgId, userId, sponsorUserInfo, loading, error } = useEffectiveSponsorId();

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">
      Error loading sponsor information: {error}
    </div>;
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Sponsor Product Catalog</h1>
      
      {sponsorOrgId ? (
        <SponsorCatalog 
          sponsorId={sponsorOrgId} 
          userId={userId}
          sponsorUserInfo={sponsorUserInfo}
        />
      ) : (
        <div className="text-center p-4 bg-yellow-100 border border-yellow-300 rounded">
          No sponsor organization found for your account. Please contact an administrator.
        </div>
      )}
    </main>
  );
}