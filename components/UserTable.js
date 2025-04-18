import React from "react";
import UserRow from "./UserRow";

export default function UserTable({
  users,
  sortConfig,
  requestSort,
  renderSortIndicator,
  expandedRows,
  toggleRowExpansion,
  expandedDetails,
  onApprove,
  onDeny,
  onEdit
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th onClick={() => requestSort("User_ID")} className="border p-2 cursor-pointer">
              User_ID {renderSortIndicator("User_ID")}
            </th>
            <th onClick={() => requestSort("FName")} className="border p-2 cursor-pointer">
              FName {renderSortIndicator("FName")}
            </th>
            <th onClick={() => requestSort("LName")} className="border p-2 cursor-pointer">
              LName {renderSortIndicator("LName")}
            </th>
            <th className="border p-2">Start_Date</th>
            <th className="border p-2">End_Date</th>
            <th className="border p-2">User_Type</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.User_ID}
              user={user}
              isExpanded={expandedRows.includes(user.User_ID)}
              toggleExpand={toggleRowExpansion}
              details={expandedDetails[user.User_ID]}
              onApprove={onApprove}
              onDeny={onDeny}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
