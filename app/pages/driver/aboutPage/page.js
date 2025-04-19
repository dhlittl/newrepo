"use client";

import { useParams } from "next/navigation";
import AboutPage from "@/components/AboutPage";

export default function UserAboutPage() {
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <AboutPage />
    </main>
  );
}
