import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveRequest,
  updateLeaveRequestStatus,
  cancelLeaveRequest,
} from "../../services/leaveRequestService";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/dateUtils";
import Badge from "../../components/ui/Badge";

export default function ViewLeaveRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [leaveRequest, setLeaveRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalComment, setApprovalComment] = useState("");

  const isManager =
    user?.role === "manager" || user?.role === "admin" || user?.role === "hr";
  const isOwnRequest = leaveRequest?.userId === user?.id;
  const isPending = leaveRequest?.status === "pending";

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        setIsLoading(true);
        const response = await getLeaveRequest(id as string);
        setLeaveRequest(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load leave request");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLeaveRequest();
    }
  }, [id]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment: string }) =>
      updateLeaveRequestStatus(id as string, { status, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["teamLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveRequest", id] });

      // Refresh the current leave request data
      getLeaveRequest(id as string).then((response) => {
        setLeaveRequest(response.data);
      });
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message || "Failed to update leave request status"
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelLeaveRequest(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveRequest", id] });

      // Refresh the current leave request data
      getLeaveRequest(id as string).then((response) => {
        setLeaveRequest(response.data);
      });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to cancel leave request");
    },
  });

  const handleApprove = () => {
    updateStatusMutation.mutate({
      status: "approved",
      comment: approvalComment,
    });
  };

  const handleReject = () => {
    updateStatusMutation.mutate({
      status: "rejected",
      comment: approvalComment,
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate();
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Leave request not found or you don't have permission to view it.
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Request Details</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {leaveRequest.leaveType?.name}
              </h2>
              <p className="text-gray-600">
                {formatDate(leaveRequest.startDate)} -{" "}
                {formatDate(leaveRequest.endDate)}
              </p>
            </div>
            <div>{renderStatusBadge(leaveRequest.status)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Request Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>
                    {leaveRequest.duration}{" "}
                    {leaveRequest.duration === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Half Day:</span>
                  <span>{leaveRequest.isHalfDay ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted On:</span>
                  <span>{formatDate(leaveRequest.createdAt)}</span>
                </div>
                {leaveRequest.status !== "pending" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{formatDate(leaveRequest.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Employee Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>
                    {leaveRequest.user?.firstName} {leaveRequest.user?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{leaveRequest.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span>{leaveRequest.user?.department || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span>{leaveRequest.user?.position || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Reason</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{leaveRequest.reason || "No reason provided."}</p>
            </div>
          </div>

          {leaveRequest.status !== "pending" && leaveRequest.statusComment && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                {leaveRequest.status === "approved" ? "Approval" : "Rejection"}{" "}
                Comment
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{leaveRequest.statusComment}</p>
              </div>
            </div>
          )}

          {/* Manager Actions */}
          {isManager && !isOwnRequest && isPending && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Manager Actions</h3>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  placeholder="Add a comment about your decision..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          )}

          {/* Employee Actions */}
          {isOwnRequest && isPending && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Actions</h3>

              <button
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
