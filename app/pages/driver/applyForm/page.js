// Driver Application Form

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
        noTrafficViolations: false,
        seatbelt: false,
        speeding: false,
        distractedDriving: false,
        recklessDriving: false,
        dui: false,
        runningStopSign: false,
        runningRedLight: false,
        other: false,
      });
      const [infractionDetails, setInfractionDetails] = useState({
        seatbelt: "",
        speeding: "",
        distractedDriving: "",
        recklessDriving: "",
        dui: "",
        runningStopSign: "",
        runningRedLight: "",
        other: "",
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

    // function to capitalize first letter in text (for infractions bug fix)
    const capitalizeFirstLetter = (text) => {
        return text
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
      };

    const handleInfractionChange = (e) => {
        const { name, checked } = e.target;

        setInfractions((prev) => {
            let updatedInfractions = { ...prev, [name]: checked };

            if (name === "noTrafficViolations" && checked) {
                // If "No Traffic Violations" is checked, uncheck all other infractions
                Object.keys(updatedInfractions).forEach((key) => {
                    if (key !== "noTrafficViolations") {
                        updatedInfractions[key] = false;
                    }
                });
            } else if (name !== "noTrafficViolations" && checked) {
                // If any infraction is checked, uncheck "No Traffic Violations"
                updatedInfractions.noTrafficViolations = false;
            }

            return updatedInfractions;
        });
    };
    

      const handleInfractionDetailsChange = (e) => {
        const { name, value } = e.target;
        setInfractionDetails((prev) => ({
          ...prev,
          [name]: value,
        }));
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (validateForm()) {
            let valid = true;
    
            // If "No Traffic Violations" is checked, allow submission
            if (!infractions.noTrafficViolations) {
                for (let infraction in infractions) {
                    if (infractions[infraction] && infraction !== "noTrafficViolations") {
                        // If an infraction is checked but no details are provided, show error
                        if (!infractionDetails[infraction]?.trim()) {
                            valid = false;
                            alert(`Please provide more information for "${capitalizeFirstLetter(infraction.replace(/([A-Z])/g, " $1"))}".`);
                            break;
                        }
                    }
                }
            }
    
            // Proceed only if the form is still valid
            if (valid) {
                const requestData = {
                    sponsorId,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    infractions,
                    infractionDetails,
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
                        // Reset form state
                        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                        setErrors({});
                        setSponsorId("");
                        setAgreements({});
                        setInfractions({
                            noTrafficViolations: false,
                            seatbelt: false,
                            speeding: false,
                            distractedDriving: false,
                            recklessDriving: false,
                            dui: false,
                            runningStopSign: false,
                            runningRedLight: false,
                            other: false,
                        });
                        setInfractionDetails({
                            seatbelt: "",
                            speeding: "",
                            distractedDriving: "",
                            recklessDriving: "",
                            dui: "",
                            runningStopSign: "",
                            runningRedLight: "",
                            other: "",
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

            {/* Infraction Checkboxes */}
            <div>
                <h3 className="text-lg font-semibold mt-4 text-black">Driving History</h3>
                <div>
                {Object.keys(infractions).map((infraction) => (
                    <div key={infraction} className="space-y-2">
                        {/* Checkbox for "No Traffic Violations" without a text box */}
                        {infraction === "noTrafficViolations" ? (
                        <div className="flex items-center">
                            <input
                            type="checkbox"
                            name={infraction}
                            checked={infractions[infraction]}
                            onChange={handleInfractionChange}
                            className="mr-2"
                            />
                            <label className="text-black">
                            {capitalizeFirstLetter(infraction.replace(/([A-Z])/g, " $1"))}
                            </label>
                        </div>
                        ) : (
                        <div className="space-y-2">
                            {/* Other infractions will show a text box */}
                            <div className="flex items-center">
                            <input
                                type="checkbox"
                                name={infraction}
                                checked={infractions[infraction]}
                                onChange={handleInfractionChange}
                                className="mr-2"
                            />
                            <label className="text-black">
                                {capitalizeFirstLetter(infraction.replace(/([A-Z])/g, " $1"))}
                            </label>
                            </div>

                            {/* Textbox for infractions other than "No Traffic Violations" */}
                            {infractions[infraction] && infraction !== "noTrafficViolations" && (
                            <div className="mt-2 pl-6">
                                <label className="block text-sm text-black">
                                Please provide more information
                                </label>
                                <input
                                type="text"
                                name={infraction}
                                value={infractionDetails[infraction]}
                                onChange={handleInfractionDetailsChange}
                                className="mt-1 p-2 w-full border rounded-md text-black"
                                />
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>

            {/* Submission Button */}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Submit
            </button>
        </form>
        </div>
    );
}
