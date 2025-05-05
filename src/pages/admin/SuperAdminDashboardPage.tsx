import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  FaUserPlus,
  FaUsers,
  FaUserShield,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "axios";
import config from "../../config";
import { useQuery } from "@tanstack/react-query";
import { getAllLeaveBalances } from "../../services/leaveBalanceService";

interface UserStats {
  total: number;
  active: number;
  managers: number;
  employees: number;
  hr: number;
}

const SuperAdminDashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    managers: 0,
    employees: 0,
    hr: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch all users to calculate stats
        const response = await axios.get(`${config.apiUrl}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.users) {
          const users = response.data.users;

          // Calculate stats
          const stats: UserStats = {
            total: users.length,
            active: users.filter((user: any) => user.isActive).length,
            managers: users.filter((user: any) => user.role === "manager")
              .length,
            employees: users.filter((user: any) => user.role === "employee")
              .length,
            hr: users.filter((user: any) => user.role === "hr").length,
          };

          setUserStats(stats);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (!userProfile || userProfile.role !== "super_admin") {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
        <p className="mt-2 text-red-600">
          You do not have permission to access the Super Admin Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Super Admin Dashboard
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          Welcome, {userProfile.firstName} {userProfile.lastName}
        </h2>
        <p className="text-gray-600">
          This is your super admin dashboard where you can manage all aspects of
          the system. As a super admin, you have exclusive access to create and
          manage user accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-700">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {isLoading ? "..." : userStats.total}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {isLoading ? "..." : userStats.active} active users
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUsers className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-700">Managers</h3>
              <p className="text-3xl font-bold text-green-800 mt-2">
                {isLoading ? "..." : userStats.managers}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Team leaders & supervisors
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserShield className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-700">
                HR Staff
              </h3>
              <p className="text-3xl font-bold text-purple-800 mt-2">
                {isLoading ? "..." : userStats.hr}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Human resources personnel
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUserShield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">User Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/users/create">
            <Button
              fullWidth
              variant="primary"
              className="flex items-center justify-center gap-2"
            >
              <FaUserPlus className="h-5 w-5" />
              <span>Create New User</span>
            </Button>
          </Link>
          <Link to="/users">
            <Button
              fullWidth
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <FaUsers className="h-5 w-5" />
              <span>Manage Users</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/leave-types">
            <Button fullWidth variant="outline">
              Manage Leave Types
            </Button>
          </Link>
          <Link to="/holidays">
            <Button fullWidth variant="outline">
              Manage Holidays
            </Button>
          </Link>
          <Link to="/approval-workflows">
            <Button fullWidth variant="outline">
              Approval Workflows
            </Button>
          </Link>
        </div>
      </div>

      {/* Leave Requests Section - Redirects to HR */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Leave Management</h2>
        <p className="text-gray-600 mb-4">
          As a Super Admin, your leave requests and approvals are handled by the
          HR department. Use the buttons below to access leave management
          features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/team-leaves">
            <Button fullWidth variant="primary">
              View Leave Requests
            </Button>
          </Link>
          <Link to="/leave-calendar">
            <Button fullWidth variant="secondary">
              Leave Calendar
            </Button>
          </Link>
          <Link to="/apply-leave">
            <Button fullWidth variant="outline">
              Apply for Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Leave Balances Section */}
      <LeaveBalancesSection />
    </div>
  );
};

// Leave Balances Section Component
const LeaveBalancesSection: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch leave balances
  const { data: leaveBalancesData, isLoading } = useQuery({
    queryKey: ["allLeaveBalances", year],
    queryFn: () => getAllLeaveBalances({ year }),
  });

  const leaveBalances = leaveBalancesData || [];

  // Filter leave balances based on search term
  const filteredBalances = leaveBalances.filter((balance: any) => {
    const userName =
      `${balance.user?.firstName} ${balance.user?.lastName}`.toLowerCase();
    const leaveType = balance.leaveType?.name.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return userName.includes(searchLower) || leaveType.includes(searchLower);
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Employee Leave Balances</h2>
        <div className="flex space-x-4">
          <div>
            <select
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value={new Date().getFullYear() - 1}>
                {new Date().getFullYear() - 1}
              </option>
              <option value={new Date().getFullYear()}>
                {new Date().getFullYear()}
              </option>
              <option value={new Date().getFullYear() + 1}>
                {new Date().getFullYear() + 1}
              </option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search employee or leave type..."
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/leave-balances">
            <Button variant="primary" className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>Manage Leave Balances</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">Leave Type</th>
                <th className="py-3 px-4 text-left">Total Days</th>
                <th className="py-3 px-4 text-left">Used Days</th>
                <th className="py-3 px-4 text-left">Remaining Days</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center">
                    No leave balances found
                  </td>
                </tr>
              ) : (
                filteredBalances.map((balance: any) => (
                  <tr
                    key={balance.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      {balance.user?.firstName} {balance.user?.lastName}
                    </td>
                    <td className="py-3 px-4">
                      {balance.user?.department || "N/A"}
                    </td>
                    <td className="py-3 px-4">{balance.leaveType?.name}</td>
                    <td className="py-3 px-4">
                      {balance.balance + (balance.carryForward || 0)}
                    </td>
                    <td className="py-3 px-4">{balance.used}</td>
                    <td className="py-3 px-4">
                      {balance.balance +
                        (balance.carryForward || 0) -
                        balance.used}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;
