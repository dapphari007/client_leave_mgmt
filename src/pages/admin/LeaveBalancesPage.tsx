import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllLeaveBalances,
  updateLeaveBalance,
} from "../../services/leaveBalanceService";
import { getAllLeaveTypes } from "../../services/leaveTypeService";
import { getAllUsers } from "../../services/userService";

export default function LeaveBalancesPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    totalDays: 0,
    adjustmentDays: 0,
    adjustmentReason: "",
  });

  const queryClient = useQueryClient();

  const { data: leaveBalances = [], isLoading: isLoadingBalances } = useQuery({
    queryKey: ["leaveBalances"],
    queryFn: getAllLeaveBalances,
  });

  const { data: leaveTypes = [] } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: getAllLeaveTypes,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateLeaveBalance(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveBalances"] });
      setIsEditModalOpen(false);
      setSelectedBalance(null);
      setSuccess("Leave balance updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update leave balance");
    },
  });

  const handleEditClick = (balance: any) => {
    setSelectedBalance(balance);
    setEditFormData({
      totalDays: balance.totalDays,
      adjustmentDays: 0,
      adjustmentReason: "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBalance) return;

    const newTotalDays =
      selectedBalance.totalDays + editFormData.adjustmentDays;

    if (newTotalDays < 0) {
      setError("Total days cannot be negative");
      return;
    }

    updateMutation.mutate({
      id: selectedBalance.id,
      totalDays: newTotalDays,
      adjustmentReason: editFormData.adjustmentReason,
    });
  };

  if (isLoadingBalances) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Balances</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <button
            className="float-right font-bold"
            onClick={() => setSuccess(null)}
          >
            &times;
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left">Employee</th>
              <th className="py-3 px-4 text-left">Leave Type</th>
              <th className="py-3 px-4 text-left">Year</th>
              <th className="py-3 px-4 text-left">Total Days</th>
              <th className="py-3 px-4 text-left">Used Days</th>
              <th className="py-3 px-4 text-left">Pending Days</th>
              <th className="py-3 px-4 text-left">Remaining Days</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveBalances.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  No leave balances found
                </td>
              </tr>
            ) : (
              leaveBalances.map((balance: any) => (
                <tr
                  key={balance.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    {balance.user?.firstName} {balance.user?.lastName}
                  </td>
                  <td className="py-3 px-4">{balance.leaveType?.name}</td>
                  <td className="py-3 px-4">{balance.year}</td>
                  <td className="py-3 px-4">{balance.totalDays}</td>
                  <td className="py-3 px-4">{balance.usedDays}</td>
                  <td className="py-3 px-4">{balance.pendingDays}</td>
                  <td className="py-3 px-4">{balance.remainingDays}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEditClick(balance)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Adjust Leave Balance for {selectedBalance.user?.firstName}{" "}
              {selectedBalance.user?.lastName}
            </h3>

            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Leave Type
                </label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  value={selectedBalance.leaveType?.name}
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Current Total Days
                </label>
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  value={selectedBalance.totalDays}
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Adjustment (+ or -)
                </label>
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editFormData.adjustmentDays}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      adjustmentDays: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  New Total Days
                </label>
                <input
                  type="number"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  value={
                    selectedBalance.totalDays + editFormData.adjustmentDays
                  }
                  disabled
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reason for Adjustment
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editFormData.adjustmentReason}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      adjustmentReason: e.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
