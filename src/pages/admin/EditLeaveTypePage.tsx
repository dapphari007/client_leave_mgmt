import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { updateLeaveType } from "../../services/leaveTypeService";
import { useLeaveType } from "../../hooks";

type FormValues = {
  name: string;
  description: string;
  defaultDays: number;
  isCarryForward: boolean;
  maxCarryForwardDays: number;
  isActive: boolean;
  applicableGender: "male" | "female" | null;
  isHalfDayAllowed: boolean;
  isPaidLeave: boolean;
};

export default function EditLeaveTypePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  console.log("EditLeaveTypePage - ID param:", id);

  const { data, isLoading: isLoadingLeaveType, isError } = useLeaveType(id);
  console.log("EditLeaveTypePage - Data from useLeaveType:", data);
  
  // Extract the leave type from the response
  const leaveType = data?.leaveType;
  console.log("EditLeaveTypePage - Leave type:", leaveType);
  
  // If there's an error fetching the leave type, show an error message
  useEffect(() => {
    if (isError) {
      setError("Failed to load leave type data. Please try again.");
    }
  }, [isError]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      defaultDays: 0,
      isCarryForward: false,
      maxCarryForwardDays: 0,
      isActive: true,
      applicableGender: null,
      isHalfDayAllowed: true,
      isPaidLeave: true,
    },
  });

  useEffect(() => {
    if (leaveType) {
      reset({
        name: leaveType.name,
        description: leaveType.description || "",
        defaultDays: leaveType.defaultDays,
        isCarryForward: leaveType.isCarryForward,
        maxCarryForwardDays: leaveType.maxCarryForwardDays || 0,
        isActive: leaveType.isActive,
        applicableGender: leaveType.applicableGender,
        isHalfDayAllowed: leaveType.isHalfDayAllowed,
        isPaidLeave: leaveType.isPaidLeave,
      });
    }
  }, [leaveType, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FormValues>) =>
      updateLeaveType(id as string, data),
    onSuccess: () => {
      navigate("/leave-types");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update leave type");
    },
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoadingLeaveType) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading leave type data...
      </div>
    );
  }

  if (!leaveType && !isLoadingLeaveType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Leave type not found or you don't have permission to view it.
        </div>
        <button
          onClick={() => navigate("/leave-types")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Leave Types
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Leave Type</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Default Days *
            </label>
            <input
              {...register("defaultDays", {
                required: "Default days is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Default days cannot be negative",
                },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
            />
            {errors.defaultDays && (
              <p className="text-red-500 text-xs italic">
                {errors.defaultDays.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description *
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-xs italic">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Applicable Gender
            </label>
            <select
              {...register("applicableGender")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isCarryForward")}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Allow Carry Forward</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Max Carry Forward Days
            </label>
            <input
              {...register("maxCarryForwardDays", {
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Max carry forward days cannot be negative",
                },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
            />
            {errors.maxCarryForwardDays && (
              <p className="text-red-500 text-xs italic">
                {errors.maxCarryForwardDays.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isHalfDayAllowed")}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Allow Half Day</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isPaidLeave")}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Paid Leave</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/leave-types")}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
