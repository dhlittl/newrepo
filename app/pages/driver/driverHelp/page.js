// Driver Help Page

"use client";
import { useEffect, useState } from "react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffectiveDriverId } from '@/hooks/useEffectiveDriverId';
import { useRouter } from 'next/navigation';

// commented out import because link isn't connected yet
//import Link from "next/link";


const HelpPage = () => {
    const router = useRouter();
    const { userId, isAssumed } = useEffectiveDriverId();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkGroup = async () => {
          try {
            const session = await fetchAuthSession();
            const groups = session.tokens?.idToken?.payload["cognito:groups"] || [];
    
            if (groups.includes("driver") || groups.includes("sponsor") || groups.includes("admin")) {
              setAuthorized(true);
            } else {
              router.replace("/unauthorized");
            }
          } catch (err) {
            console.error("Auth error:", err);
            router.replace("/login");
          }
        };
        checkGroup();
      }, [router]);
      
    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Return button for sponsors */}
            {isAssumed && (
                <button
                className="mb-4 text-sm text-gray-700 underline"
                onClick={() => {
                    sessionStorage.removeItem("assumedDriverId");
                    sessionStorage.removeItem("assumedDriverName");
                    router.push("/pages/sponsor/drivers");
                }}
                >
                ← Return to Sponsor View
                </button>
            )}
            <h1 className="text-3xl font-bold mb-6">Driver Help Page</h1>

            {/* How to Edit Driver Dashboard */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">How to Edit Your Dashboard</h2>
                <p>
                    To edit your dashboard use the checkboxes on your sidebar to toggle 
                    on and off the widgets you want to see.
                </p>
            </section>

            {/* Help Ticket Section (more development later) */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Submit a Help Ticket</h2>
                <p className="mb-4">
                    Need assistance? Click the button below to submit a help ticket to your sponsor.
                </p>
                {/*<Link href="/dashboard/driver/driverHelp/ticket-submission">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Submit a Help Ticket
                    </button>
                </Link>*/}
            </section>

            {/* FAQ Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">How do I earn points?</h3>
                        <p>
                            You earn points by demonstating good and safe driving behavior. Your sponsor
                            will award points based off of the data collected about your driving. Be careful, because
                            you can lose points for being unsafe on the road!
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">How can I redeem my points?</h3>
                    <p>
                        You can redeem your points on items in your sponsor's catalog. Access the catalog from
                        the "Catalog" button on your Dashboard.
                    </p>
                    </div> 
                    <div>
                        <h3 className="text-xl font-semibold mb-4">What should I do if I need help?</h3>
                        <p>
                            You can check this help page for guidance, or if you have a more specific problem
                            you can submit a ticket using the button above!
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpPage;