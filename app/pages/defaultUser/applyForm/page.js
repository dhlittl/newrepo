// ApplicationForm.jsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

export default function ApplicationForm() {
  /* ──────────────────────────── state ──────────────────────────── */
  const [userId, setUserId] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [sponsors, setSponsors] = useState([]);
  const [sponsorId, setSponsorId] = useState("");

  const [policies, setPolicies] = useState([]);
  const [agreements, setAgreements] = useState({});

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

  const filteredPolicies = policies.filter(
    (p) => p.Sponsor_Org_ID == sponsorId
  );

  /* ─────────────────── helpers ─────────────────── */
  const capitalizeFirst = (txt) =>
    txt.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  /* ───────── 1. resolve User_ID (Cognito → DB) ───────── */
  useEffect(() => {
    async function resolveUserId() {
      try {
        const cognito = await getCurrentUser(); // returns { userId: <cognito‑sub> }
        const cognitoSub = cognito?.userId;
        if (!cognitoSub) return;

        const res = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/user/cognito/${cognitoSub}`
        );
        const data = await res.json();
        if (res.ok && data.userId) setUserId(String(data.userId));
      } catch (e) {
        console.error("User‑ID mapping failed:", e);
      }
    }
    resolveUserId();
  }, []);

  /* ───────── 2. auto‑fill user profile fields ───────── */
  useEffect(() => {
    if (!userId) return;
    async function fetchUserInfo() {
      try {
        const res = await fetch(
          `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/defaultUser/Info?userId=${userId}`
        );
        const raw = await res.json();
        const parsed = raw.body ? JSON.parse(raw.body) : raw;
        const u = Array.isArray(parsed) ? parsed[0] : parsed;

        setFormData({
          firstName: u?.FName ?? "",
          lastName: u?.LName ?? "",
          email: u?.Email ?? "",
          phone: u?.Phone_Number ?? "",
        });
      } catch (e) {
        console.error("Auto‑fill failed:", e);
      }
    }
    fetchUserInfo();
  }, [userId]);

  /* ───────── 3. sponsors list (filtered) ───────── */
  useEffect(() => {
    if (!userId) return;
    async function fetchSponsors() {
      try {
        const [allRes, mineRes] = await Promise.all([
          fetch(
            "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors"
          ),
          fetch(
            `https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/${userId}/sponsors`
          ),
        ]);
        const all = await allRes.json();
        const mine = await mineRes.json();
        const available = all.filter(
          (s) => !mine.some((m) => m.Sponsor_Org_ID === s.Sponsor_Org_ID)
        );
        setSponsors(
          available.map((s) => ({
            id: s.Sponsor_Org_ID,
            name: s.Sponsor_Org_Name,
          }))
        );
      } catch (e) {
        console.error("Sponsor fetch error:", e);
      }
    }
    fetchSponsors();
  }, [userId]);

  /* ───────── 4. policies for selected sponsor ───────── */
  useEffect(() => {
    if (!sponsorId) return;
    async function fetchPolicies() {
      try {
        const res = await fetch(
          "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/policies"
        );
        const data = await res.json();
        const initial = {};
        data.forEach((p) => (initial[String(p.Policy_ID)] = false));
        setPolicies(data);
        setAgreements(initial);
      } catch (e) {
        console.error("Policy fetch error:", e);
      }
    }
    fetchPolicies();
  }, [sponsorId]);

  /* ─────────────────── event handlers ─────────────────── */
  const handleSponsorChange = (e) => setSponsorId(e.target.value);

  const handleInput = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAgreementToggle = (id) =>
    setAgreements((p) => ({ ...p, [id]: !p[id] }));

  const handleInfractionToggle = (e) => {
    const { name, checked } = e.target;
    setInfractions((prev) => {
      const up = { ...prev, [name]: checked };
      if (name === "noTrafficViolations" && checked)
        Object.keys(up).forEach((k) => {
          if (k !== "noTrafficViolations") up[k] = false;
        });
      else if (checked) up.noTrafficViolations = false;
      return up;
    });
  };

  const handleInfractionDetails = (e) =>
    setInfractionDetails((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ───────────────────── validation ───────────────────── */
  const validate = () => {
    const err = {};
    if (!formData.firstName.trim()) err.firstName = "First name is required.";
    if (!formData.lastName.trim()) err.lastName = "Last name is required.";
    if (
      !formData.email.trim() ||
      !/\S+@\S+\.\S+/.test(formData.email)
    )
      err.email = "Valid email is required.";
    if (!/^\d{10}$/.test(formData.phone))
      err.phone = "Phone must be 10 digits.";
    if (!sponsorId) err.sponsorId = "Please select a sponsor.";

    const allAgreed = filteredPolicies.every((p) => agreements[p.Policy_ID]);
    if (filteredPolicies.length && !allAgreed)
      err.agreements = "You must agree to all policies.";

    setErrors(err);
    return !Object.keys(err).length;
  };

  /* ───────────────────── submit ───────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (
      !infractions.noTrafficViolations &&
      Object.entries(infractions).some(
        ([k, v]) =>
          v &&
          k !== "noTrafficViolations" &&
          !infractionDetails[k]?.trim()
      )
    ) {
      alert("Please add details for all selected infractions.");
      return;
    }

    const payload = {
      userId,
      sponsorId,
      ...formData,
      infractions,
      infractionDetails,
    };

    try {
      const res = await fetch(
        "https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/Driver/application",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        setSponsorId("");
        setPolicies([]);
        setAgreements({});
      } else alert(`Error: ${data.error}`);
    } catch (e) {
      console.error("Submit error:", e);
      alert("Something went wrong submitting your application.");
    }
  };

  /* ───────────────────── render ───────────────────── */
  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black">Application Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ─── Sponsor dropdown ─── */}
        <div>
          <label className="block text-sm font-medium text-black">
            Select Sponsor
          </label>
          <select
            value={sponsorId}
            onChange={handleSponsorChange}
            className="mt-1 p-2 w-full border rounded-md text-black bg-white"
          >
            <option value="">-- Choose a Sponsor --</option>
            {sponsors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {!sponsors.length && (
            <p className="text-black text-sm mt-1">
              You have applied to all available sponsors.
            </p>
          )}
          {errors.sponsorId && (
            <p className="text-red-500 text-sm">{errors.sponsorId}</p>
          )}
        </div>

        {/* ─── User info ─── */}
        {["firstName", "lastName", "email", "phone"].map((f) => (
          <div key={f}>
            <label className="block text-sm font-medium capitalize text-black">
              {f.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type={f === "email" ? "email" : "text"}
              name={f}
              value={formData[f]}
              onChange={handleInput}
              className="mt-1 p-2 w-full border rounded-md text-black"
            />
            {errors[f] && <p className="text-red-500 text-sm">{errors[f]}</p>}
          </div>
        ))}

        {/* ─── Policies ─── */}
        {sponsorId && filteredPolicies.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mt-4 text-black">
              Sponsor Policies
            </h3>
            {filteredPolicies.map((p) => (
              <div key={p.Policy_ID} className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements[p.Policy_ID] || false}
                  onChange={() => handleAgreementToggle(p.Policy_ID)}
                  className="mr-2"
                />
                <label className="text-black">{p.Policy_Description}</label>
              </div>
            ))}
            {errors.agreements && (
              <p className="text-red-500 text-sm">{errors.agreements}</p>
            )}
          </div>
        )}

        {/* ─── Infractions ─── */}
        <div>
          <h3 className="text-lg font-semibold mt-4 text-black">
            Driving History
          </h3>
          {Object.keys(infractions).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name={key}
                  checked={infractions[key]}
                  onChange={handleInfractionToggle}
                  className="mr-2"
                />
                <label className="text-black">
                  {capitalizeFirst(key.replace(/([A-Z])/g, " $1"))}
                </label>
              </div>
              {infractions[key] && key !== "noTrafficViolations" && (
                <div className="mt-2 pl-6">
                  <label className="block text-sm text-black">
                    Please provide more information
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={infractionDetails[key]}
                    onChange={handleInfractionDetails}
                    className="mt-1 p-2 w-full border rounded-md text-black"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── Submit ─── */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
