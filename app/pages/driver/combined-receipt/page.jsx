// app/pages/driver/combined-receipt/page.jsx
// This file exposes the combined receipt component to Next.js routing

"use client";
import { Suspense } from 'react';
import CombinedReceiptPage from './combined-receipt';

export default function CombinedReceiptPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CombinedReceiptPage />
    </Suspense>
  );
}