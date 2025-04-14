// Default User Help Page

'use client';

// commented out import because link isn't connected yet
//import Link from "next/link";


const HelpPage = () => {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Help Page</h1>

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
                        <h3 className="text-xl font-semibold mb-4">How do I apply to a sponsor?</h3>
                        <p>
                            To apply to a sponsor, navigate back to your dashboard. From there you can access
                            the application page from your navigation bar at the top of the screen, or from 
                            the Application widget. Before applying, please check out the available sponsors 
                            on the Sponsor Information page!
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Where can I find information about the available Sponsors?</h3>
                        <p>
                            Information about the available sponsors can be found on the Sponsor Information page.
                            To get to this page, you can click on the Sponsor Information widget on your dashboard,
                            or you can click the "Sponsors" link on your navigation bar.
                        </p>
                    </div> 
                    <div>
                        <h3 className="text-xl font-semibold mb-4">How do I know if I've been accepted to a Sponsor?</h3>
                        <p>
                            When you're accepted to a Sponsor program, your will receive a notification through
                            email letting you know the happy news! After that, when you log on you'll be directed
                            to a new dashboard specifically for drivers! Don't worry, you can always apply to
                            more sponsors if you want the benefits from more than one!
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4">What should I do if I get rejected from a Sponsor?</h3>
                        <p>
                            If you get reject from a Sponsor program, you'll receive a notification through
                            email to let you know. Don't let this dishearten you, as you can always apply to 
                            other sponsors!
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