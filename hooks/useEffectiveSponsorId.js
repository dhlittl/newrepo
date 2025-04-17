// hooks/useEffectiveSponsorId.js
"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

/**
 * Returns an effective sponsor ID by mapping the Cognito user to their 
// hooks/useEffectiveSponsorId.js
"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

/**
 * Returns effective sponsor organization ID and user information
 * by mapping the Cognito user to their sponsor details in the database.
 */
export function useEffectiveSponsorId() {
    const [sponsorOrgId, setSponsorOrgId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [sponsorUserInfo, setSponsorUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
  
    useEffect(() => {
      async function fetchSponsorId() {
        try {
          // Get Cognito user info
          const session = await fetchAuthSession();
          const sub = session.tokens.idToken.payload["sub"];
          console.log("[useEffSponsorID] Cognito sub:", sub);
  
          // First, map Cognito sub to DB user ID
          const userRes = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/user/cognito/${sub}`
          );
          const userData = await userRes.json();
          
          if (!userRes.ok) throw new Error(userData.error || "User mapping failed");
          
          const userIdValue = userData.userId;
          setUserId(userIdValue);
          console.log("[useEffSponsorID] Mapped to userId:", userIdValue);
  
          // Now, get sponsor info for this user using the actual user ID
          const sponsorRes = await fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/AboutPage/sponsors/sponsorUsers/Info?userId=${userIdValue}`
          );
          
          if (!sponsorRes.ok) {
            // If we get a 404, the user might not be a sponsor
            if (sponsorRes.status === 404) {
              throw new Error("No sponsor information found for this user. You may not have sponsor privileges.");
            }
            const sponsorError = await sponsorRes.json();
            throw new Error(sponsorError.error || "Sponsor info retrieval failed");
          }
          
          const sponsorData = await sponsorRes.json();
          console.log("[useEffSponsorID] Sponsor data:", sponsorData);
          
          // Store the complete sponsor user info
          setSponsorUserInfo(sponsorData);
          
          // Set the Sponsor Organization ID from the sponsor data
          setSponsorOrgId(sponsorData.Sponsor_Org_ID);
        } catch (err) {
          console.error("[useEffSponsorID] Error getting sponsor ID:", err);
          setError(err.message);
          // Redirect if unauthenticated or mapping fails
          if (err.message.includes("unauthenticated") || err.message.includes("mapping failed")) {
            router.replace("/login");
          }
        } finally {
          setLoading(false);
        }
      }
  
      fetchSponsorId();
    }, [router]);
  
    return { sponsorOrgId, userId, sponsorUserInfo, loading, error };
  }