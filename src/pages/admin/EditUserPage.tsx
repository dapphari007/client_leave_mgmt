import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserById, updateUser } from "../../services/userService";
import { useUsers } from "../../hooks";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "manager" | "hr" | "admin";
  department: string;
  position: string;
  managerId?: string;
  isActive: boolean;
};

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id as string),
    enabled: !!id,
  });

  const { data: users = [] } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "employee",
      department: "",
      position: "",
      managerId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department || "",
        position: user.position || "",
        managerId: user.managerId || "",
        isActive: user.isActive,
      });
    }
  }, [user, reset]);

  const watchRole = watch("role");

  const updateMutation = useMutation({
    mutationFn: (data: Partial<FormValues>) => updateUser(id as string, data),
    onSuccess: () => {
      navigate("/users");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update user");
    },
  });

  const onSubmit = (data: FormValues) => {
    // Only include managerId if role is employee
    const userData = {
      ...data,
      managerId: data.role === "employee" ? data.managerId : undefined,
    };

    updateMutation.mutate(userData);
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading user data...
      </div>
    );
  }

  if (!user && !isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          User not found or you don't have permission to view it.
        </div>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

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
              First Name *
            </label>
            <input
              {...register("firstName", { required: "First name is required" })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs italic">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name *
            </label>
            <input
              {...register("lastName", { required: "Last name is required" })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs italic">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email *
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role *
            </label>
            <select
              {...register("role", { required: "Role is required" })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs italic">
                {errors.role.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Department
            </label>
            <input
              {...register("department")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Position
            </label>
            <input
              {...register("position")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
          </div>

          {watchRole === "employee" && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Manager
              </label>
              <select
                {...register("managerId")}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">No Manager</option>
                {users
                  .filter((u: any) => u.role === "manager" && u.id !== id)
                  .map((manager: any) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Active User</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/users")}
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
