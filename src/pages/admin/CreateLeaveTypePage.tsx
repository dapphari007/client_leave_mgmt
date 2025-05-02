import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createLeaveType } from "../../services/leaveTypeService";
import { CreateLeaveTypeData } from "../../types";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { getErrorMessage } from "../../utils/errorUtils";

const CreateLeaveTypePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateLeaveTypeData>({
    defaultValues: {
      isActive: true,
      isCarryForward: false,
      isHalfDayAllowed: true,
      isPaidLeave: true,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isCarryForward = watch("isCarryForward");

  // Handle form submission
  const onSubmit = async (data: CreateLeaveTypeData) => {
    setIsLoading(true);
    setError(null);

    try {
      await createLeaveType(data);
      navigate("/leave-types", {
        state: { message: "Leave type created successfully" },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Create Leave Type
      </h1>

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              id="name"
              label="Leave Type Name"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
          </div>

          <div>
            <Textarea
              id="description"
              label="Description"
              rows={3}
              error={errors.description?.message}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                id="defaultDays"
                type="number"
                label="Default Days"
                min={0}
                error={errors.defaultDays?.message}
                {...register("defaultDays", {
                  required: "Default days is required",
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: "Default days must be at least 0",
                  },
                })}
              />
            </div>
            <div>
              <Select
                id="applicableGender"
                label="Applicable Gender"
                error={errors.applicableGender?.message}
                options={[
                  { value: "", label: "All Genders" },
                  { value: "male", label: "Male Only" },
                  { value: "female", label: "Female Only" },
                ]}
                {...register("applicableGender")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center">
              <input
                id="isCarryForward"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("isCarryForward")}
              />
              <label
                htmlFor="isCarryForward"
                className="ml-2 block text-sm text-gray-900"
              >
                Allow Carry Forward
              </label>
            </div>
            {isCarryForward && (
              <div>
                <Input
                  id="maxCarryForwardDays"
                  type="number"
                  label="Max Carry Forward Days"
                  min={0}
                  error={errors.maxCarryForwardDays?.message}
                  {...register("maxCarryForwardDays", {
                    required:
                      "Max carry forward days is required when carry forward is enabled",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Max carry forward days must be at least 0",
                    },
                  })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center">
              <input
                id="isHalfDayAllowed"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("isHalfDayAllowed")}
              />
              <label
                htmlFor="isHalfDayAllowed"
                className="ml-2 block text-sm text-gray-900"
              >
                Allow Half Day
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="isPaidLeave"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("isPaidLeave")}
              />
              <label
                htmlFor="isPaidLeave"
                className="ml-2 block text-sm text-gray-900"
              >
                Paid Leave
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register("isActive")}
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/leave-types")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Leave Type
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateLeaveTypePage;
