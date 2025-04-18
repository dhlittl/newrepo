import React from "react";

export default function UserDetails({ user, details, onApprove, onDeny, onEdit }) {
    return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* -------- Left Column (General Info + Button) -------- */}
            <div className="md:w-1/2 space-y-2">
              <div className="flex justify-between items-center mb-1 border-b pb-1">
                <h3 className="text-lg font-semibold">General Info</h3>
                <button
                  onClick={() => onEdit(user)}
                  className="bg-green-600 text-white font-medium text-sm py-1 px-3 rounded-lg hover:bg-green-700 transition"
                >
                  Edit
                </button>
              </div>
              <p><strong>Username:</strong> {user.Username || "N/A"}</p>
              <p><strong>Email:</strong> {user.Email || "N/A"}</p>
              <p><strong>Phone:</strong> {user.Phone_Number || "N/A"}</p>
            </div>
      
            {/* -------- Right Column (Type-specific Info) -------- */}
            <div className="md:w-1/2 space-y-2">
              <h3 className="text-lg font-semibold mb-1 border-b pb-1">{user.User_Type} Info</h3>
      
              {user.User_Type === "Default" && (() => {
                const apps = (details || []).filter(a => a.Application_ID);
                if (apps.length === 0) return <p className="italic text-gray-500">No applications</p>;
                return apps.map((app, idx) => (
                  <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Application #{app.Application_ID}</h4>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        app.App_Status === "Pending" ? "bg-amber-100 text-amber-800" :
                        app.App_Status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {app.App_Status}
                      </span>
                    </div>
                    <p><strong>Sponsor:</strong> {app.Sponsor_Name || app.Sponsor_Org_ID}</p>
                    <p><strong>Submitted:</strong> {app.Submitted_At}</p>
                    {app.Processed_At && <p><strong>Processed:</strong> {app.Processed_At}</p>}
                    {app.App_Status === "Pending" && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => onApprove(user, app)} className="px-3 py-1 bg-green-500 text-white rounded-lg">Approve</button>
                        <button onClick={() => onDeny(user, app)} className="px-3 py-1 bg-red-500 text-white rounded-lg">Deny</button>
                      </div>
                    )}
                  </div>
                ));
              })()}
      
              {user.User_Type === "Driver" &&
                (details || []).map((entry, i) => (
                  <div key={i} className="border rounded-lg p-4 mb-4 shadow-sm">
                    <p><strong>Sponsor:</strong> {entry.Sponsor_Name || entry.Sponsor_Org_ID}</p>
                    <p><strong>Points:</strong> {entry.Point_Balance}</p>
                    <p><strong>Purchases:</strong> {entry.Num_Purchases}</p>
                  </div>
              ))}
      
              {user.User_Type === "Sponsor" &&
                (details || []).map((entry, i) => (
                  <div key={i} className="border rounded-lg p-4 mb-4 shadow-sm">
                    <p><strong>Organization:</strong> {entry.Sponsor_Name || entry.Sponsor_Org_ID}</p>
                    <p><strong>Point Changes:</strong> {entry.Num_Point_Changes}</p>
                  </div>
              ))}
      
              {user.User_Type === "Admin" &&
                (details || []).map((entry, i) => (
                  <div key={i} className="border rounded-lg p-4 mb-4 shadow-sm">
                    <p><strong>Admin ID:</strong> {entry.Admin_ID}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      );        
}
