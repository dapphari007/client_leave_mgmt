import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getAllApprovalWorkflows,
  deleteApprovalWorkflow,
  ApprovalWorkflow,
} from "../../services/approvalWorkflowService";

export default function ApprovalWorkflowsPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: workflows = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["approvalWorkflows"],
    queryFn: getAllApprovalWorkflows,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApprovalWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvalWorkflows"] });
      setIsDeleteModalOpen(false);
      setWorkflowToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setWorkflowToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteMutation.mutate(workflowToDelete);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );

  if (error)
    return <div className="text-red-500">Error loading approval workflows</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Approval Workflows</h1>
        <Link
          to="/approval-workflows/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create New Workflow
        </Link>
      </div>

      {workflows.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No approval workflows found.</p>
          <Link
            to="/approval-workflows/create"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Create your first workflow
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Steps</th>
                <th className="py-3 px-4 text-left">Created At</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow: ApprovalWorkflow) => (
                <tr
                  key={workflow.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{workflow.name}</td>
                  <td className="py-3 px-4">{workflow.description || "-"}</td>
                  <td className="py-3 px-4">{workflow.steps.length}</td>
                  <td className="py-3 px-4">
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Link
                      to={`/approval-workflows/edit/${workflow.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(workflow.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this approval workflow? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
