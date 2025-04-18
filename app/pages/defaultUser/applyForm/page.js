// Default User Application Form

"use client";
import { useEffect, useState } from "react";
import { useEffectiveDriverId } from "@/hooks/useEffectiveDriverId";

export default function ApplicationForm() {
  const { userId } = useEffectiveDriverId();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [policies, setPolicies] = useState([]);
  const [agreements, setAgreements] = useState({});
  const [sponsorId, setSponsorId] = useState("");
  const [sponsors, setSponsors] = useState([]);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors");
        const data = await response.json();
        const transformed = data.map(s => ({ id: s.Sponsor_Org_ID, name: s.Sponsor_Org_Name }));
        setSponsors(transformed);
      } catch (err) {
        console.error("Error fetching sponsors:", err);
      }
    }

    fetchSponsors();
  }, []);

  useEffect(() => {
    if (!sponsorId) return;

    async function fetchPolicies() {
      try {
        const response = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/policies");
        const data = await response.json();
        const initial = {};
        data.forEach(p => { initial[String(p.Policy_ID)] = false; });
        setPolicies(data);
        setAgreements(initial);
      } catch (err) {
        console.error("Error fetching policies:", err);
      }
    }

    fetchPolicies();
  }, [sponsorId]);

  // 🔄 Auto-fill user info from DB
  useEffect(() => {
    async function fetchUserInfo() {
      if (!userId) return;

      try {
        const res = await fetch(`https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${userId}`);
        const data = await res.json();
        const parsed = data.body ? JSON.parse(data.body) : data;
        const user = Array.isArray(parsed) ? parsed[0] : parsed;

        setFormData({
          firstName: user.FName || "",
          lastName: user.LName || "",
          email: user.Email || "",
          phone: user.Phone_Number || ""
        });
      } catch (err) {
        console.error("Failed to auto-fill user info:", err);
      }
    }

    fetchUserInfo();
  }, [userId]);

  const capitalizeFirstLetter = (text) =>
    text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  const handleSponsorChange = (e) => {
    setSponsorId(e.target.value);
    localStorage.setItem("selectedSponsor", e.target.value);
  };

  const handleAgreementChange = (id) => {
    setAgreements(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
  };

  const handleInfractionChange = (e) => {
    const { name, checked } = e.target;
    setInfractions(prev => {
      const updated = { ...prev, [name]: checked };
      if (name === "noTrafficViolations" && checked) {
        Object.keys(updated).forEach(k => { if (k !== "noTrafficViolations") updated[k] = false; });
      } else if (checked) {
        updated.noTrafficViolations = false;
      }
      return updated;
    });
  };

  const handleInfractionDetailsChange = (e) => {
    const { name, value } = e.target;
    setInfractionDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required.";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Valid phone number is required.";
    if (!sponsorId) newErrors.sponsorId = "Please select a sponsor.";

    const allAgreed = filteredPolicies.every(policy => agreements[String(policy.Policy_ID)]);
    if (filteredPolicies.length > 0 && !allAgreed) {
      newErrors.agreements = "You must agree to all policies";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Error: User ID not available. Please make sure you're logged in.");
      return;
    }

    if (!validateForm()) return;

    let valid = true;
    if (!infractions.noTrafficViolations) {
      for (let key in infractions) {
        if (infractions[key] && key !== "noTrafficViolations" && !infractionDetails[key]?.trim()) {
          alert(`Please provide more info for "${capitalizeFirstLetter(key.replace(/([A-Z])/g, " $1"))}"`);
          valid = false;
          break;
        }
      }
    }

    if (!valid) return;

    const requestData = {
      sponsorId,
      userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      infractions,
      infractionDetails,
    };

    try {
      const res = await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const resData = await res.json();

      if (res.ok) {
        alert("Application submitted successfully!");
        setFormData({ firstName: "", lastName: "", email: "", phone: "" });
        setSponsorId("");
        setAgreements({});
        setErrors({});
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
        alert(`Error: ${resData.error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while submitting your application.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Application Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Sponsor Dropdown */}
        <div>
          <label className="block text-sm font-medium text-black">Select Sponsor</label>
          <select value={sponsorId} onChange={handleSponsorChange} className="mt-1 p-2 w-full border rounder-md text-black bg-white">
            <option value="">-- Choose a Sponsor --</option>
            {sponsors.map(sponsor => (
              <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>
            ))}
          </select>
          {errors.sponsorId && <p className="text-red-500 text-sm">{errors.sponsorId}</p>}
        </div>

        {/* User Info Fields */}
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

        {/* Policies */}
        {sponsorId && filteredPolicies.length > 0 && (
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

        {/* Infractions Section */}
        <div>
          <h3 className="text-lg font-semibold mt-4 text-black">Driving History</h3>
          {Object.keys(infractions).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name={key}
                  checked={infractions[key]}
                  onChange={handleInfractionChange}
                  className="mr-2"
                />
                <label className="text-black">{capitalizeFirstLetter(key.replace(/([A-Z])/g, " $1"))}</label>
              </div>
              {infractions[key] && key !== "noTrafficViolations" && (
                <div className="mt-2 pl-6">
                  <label className="block text-sm text-black">Please provide more information</label>
                  <input
                    type="text"
                    name={key}
                    value={infractionDetails[key]}
                    onChange={handleInfractionDetailsChange}
                    className="mt-1 p-2 w-full border rounded-md text-black"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Submit</button>
      </form>
    </div>
  );
}
