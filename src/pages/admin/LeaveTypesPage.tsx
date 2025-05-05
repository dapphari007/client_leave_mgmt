import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getLeaveTypes,
  activateLeaveType,
  deactivateLeaveType,
} from "../../services/leaveTypeService";
import { LeaveType } from "../../types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { getErrorMessage } from "../../utils/errorUtils";

const LeaveTypesPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch leave types
  const { data, refetch } = useQuery({
    queryKey: ["leaveTypes", selectedStatus],
    queryFn: () =>
      getLeaveTypes({
        isActive:
          selectedStatus !== "all" ? selectedStatus === "active" : undefined,
      }),
    onError: (err: any) => setError(getErrorMessage(err)),
  });

  // Handle activate/deactivate leave type
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isActive) {
        await deactivateLeaveType(id);
        setSuccessMessage("Leave type deactivated successfully");
      } else {
        await activateLeaveType(id);
        setSuccessMessage("Leave type activated successfully");
      }
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Types</h1>
        <div className="flex space-x-2">
          <Link to="/leave-types/config">
            <Button variant="secondary">Configure Leave Types</Button>
          </Link>
          <Link to="/leave-types/create">
            <Button>Create Leave Type</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      {successMessage && (
        <Alert
          variant="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {data?.leaveTypes && data.leaveTypes.length > 0 ? (
          data.leaveTypes.map((leaveType: LeaveType) => (
            <Card key={leaveType.id}>
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 mr-2">
                      {leaveType.name}
                    </h3>
                    <Badge variant={leaveType.isActive ? "success" : "danger"}>
                      {leaveType.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {leaveType.description}
                  </p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Default Days:</span>{" "}
                      {leaveType.defaultDays}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Carry Forward:</span>{" "}
                      {leaveType.isCarryForward ? "Yes" : "No"}
                    </div>
                    {leaveType.isCarryForward && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Max Carry Forward:</span>{" "}
                        {leaveType.maxCarryForwardDays || "N/A"}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Half Day Allowed:</span>{" "}
                      {leaveType.isHalfDayAllowed ? "Yes" : "No"}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Paid Leave:</span>{" "}
                      {leaveType.isPaidLeave ? "Yes" : "No"}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Gender Specific:</span>{" "}
                      {leaveType.applicableGender || "All"}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/leave-types/${leaveType.id}`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant={leaveType.isActive ? "danger" : "success"}
                    size="sm"
                    onClick={() =>
                      handleToggleStatus(leaveType.id, leaveType.isActive)
                    }
                    disabled={isLoading}
                  >
                    {leaveType.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No leave types found matching the selected filters.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeaveTypesPage;
