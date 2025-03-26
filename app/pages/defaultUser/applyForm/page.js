// Application Form

"use client";
import {useEffect, useState} from "react";

export default function ApplicationForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [policies, setPolicies] = useState([]);  // creating const for policies featch from backend
    const [agreements, setAgreements] = useState({});  // creating const for checkboxes
    const [sponsorId, setSponsorId] = useState("");  // creating const for sponsor ID for retreival
    const [sponsors, setSponsors] = useState([]);  // creating const for sponsors for retreival
    const [errors, setErrors] = useState({});  // creating const for errors

    const [infractions, setInfractions] = useState({
        noTrafficInfractions: false,
        seatbeltViolation: false,
        speeding: false,
        distractedDriving: false,
        recklessDriving: false,
        dui: false,
        runningStopSign: false,
        runningRedLight: false,
        other: false,
        otherDetails: "",
    });

    const filteredPolicies = policies.filter(policy => policy.Sponsor_Org_ID == sponsorId);

    // fetch available sponsor from backend db
    useEffect(() => {
        async function fetchSponsors() {
            try {
                const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors"); // INSERT DB LINK HERE
                const data = await response.json();

                const transformedData = data.map((sponsor) => ({
                    id: sponsor.Sponsor_Org_ID,
                    name: sponsor.Sponsor_Org_Name
                }));

                setSponsors(transformedData);
            }
            catch (error) {
                console.error("Error fetching sponsors:", error);
            } 
        }
        fetchSponsors();
    }, []);


    // fetch policies once sponsor is selected from dropdown
    useEffect(() => {
        if(!sponsorId) return; // if no sponsor is selected
        async function fetchPolicies() {
            try {
                const response = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/policies`); // INSERT DB LINK HERE
                const data = await response.json();

                const initialAgreements = {};
                    data.forEach(policy => {
                    initialAgreements[String(policy.Policy_ID)] = false;
                });

                setPolicies(data);
                setAgreements(initialAgreements);
            } catch (error) {
                console.error("Error fetching policies:", error);
            }
        }
        fetchPolicies();
    }, [sponsorId]);


    // handle the sponsor change
    const handleSponsorChange = (e) => {
        console.log("Selected Sponsor ID:", e.target.value);
        setSponsorId(e.target.value);

        // store sponsor choice in dropdown locally
        // holds in case user refreshes page or comes back to application later
        localStorage.setItem("selectedSponsor", e.target.value); 
    }

    // handle the agreement change
    const handleAgreementChange = (policyId) => {
        setAgreements((prev) => {
            const updatedAgreements = {
                ...prev,
                [String(policyId)]: !prev[String(policyId)], // Toggle agreement status
            };
    
            return updatedAgreements;
        });
    };

    const handleInfractionChange = (e) => {
        const { name, checked } = e.target;
        setInfractions((prev) => ({
            ...prev,
            [name]: checked,
            ...(name !== "noTrafficInfractions" && name !== "other" ? { otherDetails: "" } : {}),
        }));
    };

    const handleOtherDetailsChange = (e) => {
        setInfractions({ ...infractions, otherDetails: e.target.value });
    };


    const validateForm = () => {
        let newErrors = {};
        if(!formData.firstName.trim()) newErrors.firstName = "First name is required.";
        if(!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
        if(!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Valid email is required.";
        if(!formData.phone.trim() || !/^\d{10}$/.test(formData.phone))
            newErrors.phone = "Valid phone number is required.";
        if (!sponsorId) newErrors.sponsorId = "Please select a sponsor.";

        // validate sponsor policies section
        const allAgreed = filteredPolicies.every(
            policy => agreements[String(policy.Policy_ID)] === true
          );
          if (filteredPolicies.length > 0 && !allAgreed) {
            newErrors.agreements = "You must agree to all policies";
          }

        // validate infraction section
        if (Object.values(infractions).some(value => value === true && value !== "noTrafficInfractions")) {
            if (!infractions.otherDetails && (infractions.seatbeltViolation || infractions.speeding || infractions.distractedDriving || infractions.recklessDriving || infractions.dui || infractions.runningStopSign || infractions.runningRedLight)) {
                newErrors.infractionDetails = "Please provide more details for the selected infraction(s).";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            
            const requestData = {
                sponsorId: sponsorId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                infractions: infractions,
            };
        
            console.log("Submitting data:", requestData);
        
            try {
                const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/application", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });
        
                const responseData = await response.json();
                console.log("API Response:", responseData);
        
                if (response.ok) {
                    alert("Application submitted successfully!");
                    setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                    });
                    setErrors({});
                    setSponsorId("");
                    setAgreements({});
                    setInfractions({
                        noTrafficInfractions: false,
                        seatbeltViolation: false,
                        speeding: false,
                        distractedDriving: false,
                        recklessDriving: false,
                        dui: false,
                        runningStopSign: false,
                        runningRedLight: false,
                        other: false,
                        otherDetails: "",
                    });
                } else {
                    console.error("Error submitting application:", responseData.error);
                    alert(`Error: ${responseData.error}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while submitting your application.");
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-black">Application Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sponsor Drop Down */}
            <div>
                <label className="block text-sm font-medium text-black">Select Sponsor</label>
                <select value={sponsorId} onChange={handleSponsorChange} className="mt-1 p-2 w-full border rounder-md text-black bg-white">
                    <option value="">-- Choose a Sponsor --</option>
                    {sponsors.map((sponsor) => {
                        return (
                            <option key={sponsor.id} value={sponsor.id}>
                                {sponsor.name}
                                </option>
                        );
                        })}
                </select>
                {errors.sponsorId && <p className="text-red-500 text-sm">{errors.sponsorId}</p>}
            </div>

            {/* User Input Fields */}
            {["firstName", "lastName", "email", "phone"].map((field) => (
            <div key={field}>
                <label className="block text-sm font-medium capitalize text-black">{field.replace(/([A-Z])/g, " $1")}</label>
                <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md text-black"
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
            </div>
            ))}

            {/* Sponsor Policies */}
            {sponsorId && policies.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mt-4 text-black">Sponsor Policies</h3>
                    {filteredPolicies.map((policy) => (
                        <div key={policy.Policy_ID} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={agreements[policy.Policy_ID] || false}
                                onChange={() => handleAgreementChange(Number(policy.Policy_ID))}
                                className="mr-2"
                            />
                            <label className="text-black">{policy.Policy_Description}</label>
                        </div>
                    ))}
                    {errors.agreements && <p className="text-red-500 text-sm">{errors.agreements}</p>}
                </div>
            )}

            {/* Traffic Infractions Section */}
            <div>
                <h3 className="text-lg font-semibold mt-4 text-black">Traffic Violations History</h3>
                <div className="space-y-2">
                    {[
                        "noTrafficInfractions",
                        "seatbeltViolation",
                        "speeding",
                        "distractedDriving",
                        "recklessDriving",
                        "dui",
                        "runningStopSign",
                        "runningRedLight",
                        "other",
                    ].map((infraction) => (
                        <div key={infraction} className="flex items-center">
                            <input
                                type="checkbox"
                                name={infraction}
                                checked={infractions[infraction]}
                                onChange={handleInfractionChange}
                                className="mr-2"
                            />
                            <label className="text-black">{infraction.replace(/([A-Z])/g, " $1")}</label>
                        </div>
                    ))}
                    {infractions.other && (
                        <div>
                            <label className="text-sm font-medium text-black">Please provide details for "Other":</label>
                            <textarea
                                value={infractions.otherDetails}
                                onChange={handleOtherDetailsChange}
                                className="mt-1 p-2 w-full border rounded-md text-black"
                            />
                        </div>
                    )}
                    {errors.infractionDetails && <p className="text-red-500 text-sm">{errors.infractionDetails}</p>}
                </div>
            </div>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Submit
            </button>
        </form>
        </div>
    );
}
