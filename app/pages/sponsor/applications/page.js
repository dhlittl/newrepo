"use client";
import  React , { useState } from 'react';
import { useRouter } from "next/navigation";

const checkUserSession = async () => {
  const router = useRouter();
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    
    if (idToken) {
      const groups = idToken.payload["cognito:groups"] || [];
    }

    if(!groups.include("Sponsor")) router.push("/pages/aboutpage");
  } catch (error) {
    router.push("/pages/aboutpage");
  }
};

export default function HelpDesk() {
    checkUserSession();
    return (
      <main>
        <h1>Pending Applications</h1>
      </main>
    );
  }
