import React from "react";
import UserDetails from "./UserDetails";

export default function UserRow({ user, isExpanded, toggleExpand, details, onApprove, onDeny, onEdit }) {
  return (
    <>
      <tr onClick={() => toggleExpand(user)} className="cursor-pointer hover:bg-gray-100">
        <td className="border p-2">{user.User_ID}</td>
        <td className="border p-2">{user.FName}</td>
        <td className="border p-2">{user.LName}</td>
        <td className="border p-2">{user.Start_Date}</td>
        <td className="border p-2">{user.End_Date}</td>
        <td className="border p-2">{user.User_Type}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-white">
          <td colSpan={6} className="border p-4">
            <UserDetails
              user={user}
              details={details}
              onApprove={onApprove}
              onDeny={onDeny}
              onEdit={onEdit}
            />
          </td>
        </tr>
      )}
    </>
  );
}
