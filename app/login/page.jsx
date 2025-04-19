"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Required</h1>
      <p className="mb-4">You need to be logged in as a driver, sponsor, or admin to access that page.</p>
      
      <div className="flex flex-col space-y-4">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded text-center">
          Return to Home
        </Link>
        
        {/* Add your actual login link/button here */}
        <p className="text-sm text-gray-600">
          If you believe you should have access, please contact an administrator.
        </p>
      </div>
    </div>
  );
}