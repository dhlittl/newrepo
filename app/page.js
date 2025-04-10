"use client";
import React, { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import "../amplify-config"; 

const Redirector = ({ user, onRedirect }) => {
  useEffect(() => {
    if (user) {
      onRedirect();
    }
  }, [user, onRedirect]);
  return null;
};

export default function HomePage() {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  const handleRedirect = async () => {
    if (hasRedirected) return; // prevent duplicate redirects
    try {
      const session = await fetchAuthSession();
      const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];
      
      if (groups.includes("admin")) {
        router.push("/pages/admin");
      } else if (groups.includes("sponsor")) {
        router.push("/pages/sponsor");
      } else if (groups.includes("driver")) {
        router.push("/pages/driver");
      } else if (groups.includes("defaultUser")) {
        router.push("/pages/defaultUser");
      }
      setHasRedirected(true);
    } catch (error) {
      console.error("Error fetching session for redirect:", error);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <Redirector user={user} onRedirect={handleRedirect} />
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold text-black mb-6">Happy Driverz Inc</h1>
            {user && <p className="text-xl text-gray-700 mb-4">Welcome, {user.username}</p>}
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </Authenticator>
  );
}
