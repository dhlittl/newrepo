// lib/useEffectiveDriverId.js
"use client";

import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

/**
 * Returns an effective driver ID: either an assumed override (sponsor impersonation)
 * or the real mapped Cognito user as stored in your DB.
 */
export function useEffectiveDriverId() {
  const [userId, setUserId] = useState(null);
  const [isAssumed, setIsAssumed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1) Check for sponsor "assume" override
    const override = sessionStorage.getItem("assumedDriverId");
    if (override) {
      console.log("[useEffID] Using override driverId:", override);
      setUserId(Number(override));
      setIsAssumed(true);
      return;
    }

    // 2) Otherwise, map real Cognito user -> DB userId
    console.log("[useEffID] No override, fetching real driverId");
    async function fetchRealDriverId() {
      try {
        const session = await fetchAuthSession();
        const sub = session.tokens.idToken.payload["sub"];
        console.log("[useEffID] Cognito sub:", sub);

        const res = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${sub}`
        );
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "mapping failed");

        console.log("[useEffID] Mapped to driverId:", body.userId);
        setUserId(body.userId);
      } catch (err) {
        console.error("[useEffID] Error mapping userId:", err);
        // Redirect if unauthenticated or mapping fails
        router.replace("/login");
      }
    }

    fetchRealDriverId();
  }, [router]);

  return { userId, isAssumed };
}
