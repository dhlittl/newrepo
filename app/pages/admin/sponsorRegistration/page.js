"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const checkUserSession = async () => {
    const router = useRouter();
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (idToken) {
        const groups = idToken.payload["cognito:groups"] || [];
      }

      if(!groups.include("Admin")) router.push("/pages/aboutpage");
    } catch (error) {
      router.push("/pages/aboutpage");
    }
  };

export default function SponsorRegistration() {
    checkUserSession();
    const [formData, setFormData] = useState({
        sponsorName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        if(!formData.sponsorName.trim()) newErrors.sponsorName = "Sponsor Name is required.";
        if(!formData.firstName.trim()) newErrors.firstName = "First name is required.";
        if(!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
        if(!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Valid email is required.";
        if(!formData.phone.trim() || !/^\d{10}$/.test(formData.phone))
            newErrors.phone = "Valid phone number is required.";
        if (!formData.password.trim()) newErrors.password = "Password is required.";
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response =  await fetch("https://se1j4axgel.execute-api.us-east-1.amazonaws.com/Team24/sponsors/registration", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sponsorName: formData.sponsorName,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                    }),
                });

                const result = await response.JSON();

                if (response.ok) {
                    alert('Sponsor Registered Successfully!\n' + result);
                    setFormData({
                        sponsorName: '',
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        password: '',
                        confirmPassword: '',
                    });
                    setErrors({});
                } else {
                    alert('Failed to register sponsor: ' + result);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while registering sponsor.');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    return (
        <div className="max-w-md mx-auto bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-black">Sponsor Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            {["sponsorName", "firstName", "lastName", "email", "phone", "password", "confirmPassword"].map((field) => (
            <div key={field}>
                <label className="block text-sm font-medium capitalize text-black">{field.replace(/([A-Z])/g, " $1")}</label>
                <input
                type={field === "password" || field === "confirmPassword" ? "password" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-md text-black"
                />
                {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
            </div>
            ))}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Register
            </button>
        </form>
        </div>
    );
}
