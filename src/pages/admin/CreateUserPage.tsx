import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { createUser, getUsers } from "../../services/userService";
import { CreateUserData } from "../../services/userService";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { getErrorMessage } from "../../utils/errorUtils";

const CreateUserPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateUserData>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const selectedRole = watch("role");

  // Fetch managers for the manager selection dropdown
  const { data: managersData } = useQuery({
    queryKey: ["managers"],
    queryFn: () => getUsers({ role: "manager" }),
  });

  // Handle form submission
  const onSubmit = async (data: CreateUserData) => {
    setIsLoading(true);
    setError(null);

    try {
      await createUser(data);
      navigate("/users", { state: { message: "User created successfully" } });
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create User</h1>

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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                id="firstName"
                label="First Name"
                error={errors.firstName?.message}
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
            </div>
            <div>
              <Input
                id="lastName"
                label="Last Name"
                error={errors.lastName?.message}
                {...register("lastName", { required: "Last name is required" })}
              />
            </div>
          </div>

          <div>
            <Input
              id="email"
              type="email"
              label="Email Address"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
            />
          </div>

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                  message:
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                },
              })}
            />
          </div>

          <div>
            <Input
              id="phoneNumber"
              label="Phone Number (optional)"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber", {
                pattern: {
                  value: /^\+?[0-9]{10,15}$/,
                  message: "Invalid phone number",
                },
              })}
            />
          </div>

          <div>
            <Input
              id="address"
              label="Address (optional)"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Select
                id="role"
                label="Role"
                error={errors.role?.message}
                options={[
                  { value: "employee", label: "Employee" },
                  { value: "team_lead", label: "Team Lead" },
                  { value: "manager", label: "Manager" },
                  { value: "admin", label: "Admin" },
                  { value: "hr", label: "HR" },
                  { value: "super_admin", label: "Super Admin" },
                ]}
                {...register("role", { required: "Role is required" })}
              />
            </div>
            <div>
              <Select
                id="gender"
                label="Gender (optional)"
                error={errors.gender?.message}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                {...register("gender")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                id="department"
                label="Department"
                error={errors.department?.message}
                {...register("department")}
              />
            </div>
            <div>
              <Input
                id="position"
                label="Position"
                error={errors.position?.message}
                {...register("position")}
              />
            </div>
          </div>

          {(selectedRole === "employee" || selectedRole === "team_lead") && (
            <div>
              <Select
                id="managerId"
                label="Manager"
                error={errors.managerId?.message}
                options={
                  managersData && managersData.users
                    ? managersData.users.map((manager: any) => ({
                        value: manager.id,
                        label: `${manager.firstName} ${manager.lastName}`,
                      }))
                    : []
                }
                placeholder="Select a manager"
                {...register("managerId", {
                  required: "Manager is required for employees and team leads",
                })}
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/users")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUserPage;
