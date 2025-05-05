import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTeamLeaveRequests,
  updateLeaveRequestStatus,
} from "../../services/leaveRequestService";
import { LeaveRequest, UpdateLeaveRequestStatusData } from "../../types";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Textarea from "../../components/ui/Textarea";
import { formatDate } from "../../utils/dateUtils";
import { getErrorMessage } from "../../utils/errorUtils";
import { useAuth } from "../../context/AuthContext";

const TeamLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [comments, setComments] = useState<string>("");
  const [actionLeaveId, setActionLeaveId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Determine user role for approval level
  const userRole = user?.role || "";
  const isTeamLead = userRole === "team_lead";
  const isManager = userRole === "manager";
  const isHR = userRole === "hr";
  const isSuperAdmin = userRole === "super_admin";

  // Determine approval level based on role
  const getApprovalLevel = () => {
    if (isTeamLead) return "L1";
    if (isManager) return "L2";
    if (isHR) return "L3";
    if (isSuperAdmin) return "L4";
    return "";
  };

  // Fetch team leave requests
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["teamLeaveRequests", selectedYear, selectedStatus],
    queryFn: () =>
      getTeamLeaveRequests({
        year: selectedYear,
        status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
      }),
    onError: (err: any) => setError(getErrorMessage(err)),
  });

  // Handle approve/reject leave request
  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    if (status === "approved") {
      setIsApproving(true);
    } else {
      setIsRejecting(true);
    }

    try {
      const data: UpdateLeaveRequestStatusData = {
        status,
        comments: comments.trim() || undefined,
      };

      await updateLeaveRequestStatus(id, data);
      setSuccessMessage(`Leave request ${status} successfully`);
      setActionLeaveId(null);
      setComments("");
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  // Helper function to render leave status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      case "cancelled":
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate year options for filter
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Team Leave Requests
        </h1>
        <Badge variant="primary" className="text-sm">
          Approval Level: {getApprovalLevel()}
        </Badge>
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
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year
            </label>
            <select
              id="year"
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.leaveRequests && data.leaveRequests.length > 0 ? (
            data.leaveRequests.map((request: LeaveRequest) => (
              <Card key={request.id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.user?.firstName} {request.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Leave Type:</span>{" "}
                      {request.leaveType?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Duration:</span>{" "}
                      {formatDate(request.startDate)} -{" "}
                      {formatDate(request.endDate)} ({request.numberOfDays}{" "}
                      day(s))
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Type:</span>{" "}
                      {request.requestType.replace("_", " ")}
                    </p>
                    {request.reason && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Reason:</span>{" "}
                        {request.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {renderStatusBadge(request.status)}

                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        {actionLeaveId !== request.id ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => setActionLeaveId(request.id)}
                            >
                              Approve/Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setActionLeaveId(null);
                              setComments("");
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {actionLeaveId === request.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <Textarea
                      label="Comments (optional)"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments for the employee"
                      rows={2}
                    />
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={isRejecting}
                        onClick={() =>
                          handleUpdateStatus(request.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        isLoading={isApproving}
                        onClick={() =>
                          handleUpdateStatus(request.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No leave requests found for the selected filters.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamLeavesPage;
