// components/ui/ConfirmButton.jsx
"use client";

import { useState } from 'react';

/**
 * A button that requires confirmation before executing an action
 */
const ConfirmButton = ({
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  buttonText,
  buttonClass = "px-2 py-1 text-red-500 hover:bg-red-50 rounded",
  confirmClass = "px-2 py-1 bg-red-500 text-white rounded",
  cancelClass = "px-2 py-1 bg-gray-200 rounded"
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return showConfirm ? (
    <div className="flex gap-2">
      <button 
        onClick={() => setShowConfirm(false)}
        className={cancelClass}
      >
        {cancelText}
      </button>
      <button 
        onClick={() => {
          setShowConfirm(false);
          onConfirm();
        }}
        className={confirmClass}
      >
        {confirmText}
      </button>
    </div>
  ) : (
    <button 
      onClick={() => setShowConfirm(true)}
      className={buttonClass}
    >
      {buttonText}
    </button>
  );
};

export default ConfirmButton;