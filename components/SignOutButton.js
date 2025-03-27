"use client";

import { signOut } from 'aws-amplify/auth';
import { useRouter } from "next/navigation";


export default function SignOutButton() {
    const router = useRouter();
  
    const handleSignOut = async () => {
      try {
        await signOut();
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };
  
    return <button onClick={handleSignOut}>Sign Out</button>;
  }