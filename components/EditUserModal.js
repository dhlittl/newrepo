// components/EditUserModal.jsx
import React from "react";

export default function EditUserModal({ isOpen, formData, setFormData, onClose, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Edit User Info</h2>
        <form onSubmit={onSave}>
          {Object.entries(formData).map(([key, val]) => (
            <div key={key} className="mb-3">
              <label className="block mb-1 font-medium capitalize">{key.replace("_", " ")}</label>
              <input
                type="text"
                name={key}
                value={val}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
