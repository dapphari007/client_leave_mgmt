import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";

// Leave Pages
import MyLeavesPage from "./pages/leaves/MyLeavesPage";
import ApplyLeavePage from "./pages/leaves/ApplyLeavePage";
import TeamLeavesPage from "./pages/leaves/TeamLeavesPage";
import ViewLeaveRequestPage from "./pages/leaves/ViewLeaveRequestPage";

// Profile Pages
import ProfilePage from "./pages/profile/ProfilePage";

// Admin Pages
import UsersPage from "./pages/admin/UsersPage";
import CreateUserPage from "./pages/admin/CreateUserPage";
import EditUserPage from "./pages/admin/EditUserPage";
import LeaveTypesPage from "./pages/admin/LeaveTypesPage";
import CreateLeaveTypePage from "./pages/admin/CreateLeaveTypePage";
import EditLeaveTypePage from "./pages/admin/EditLeaveTypePage";
import HolidaysPage from "./pages/admin/HolidaysPage";
import CreateHolidayPage from "./pages/admin/CreateHolidayPage";
import EditHolidayPage from "./pages/admin/EditHolidayPage";
import LeaveBalancesPage from "./pages/admin/LeaveBalancesPage";
import ApprovalWorkflowsPage from "./pages/admin/ApprovalWorkflowsPage";
import CreateApprovalWorkflowPage from "./pages/admin/CreateApprovalWorkflowPage";
import EditApprovalWorkflowPage from "./pages/admin/EditApprovalWorkflowPage";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Define route structure for React Router v7
const router = createBrowserRouter([
  // Public Routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Protected Routes - All Users
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/my-leaves",
        element: <MyLeavesPage />,
      },
      {
        path: "/apply-leave",
        element: <ApplyLeavePage />,
      },
      {
        path: "/leave-requests/:id",
        element: <ViewLeaveRequestPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },

  // Manager Routes
  {
    element: <ProtectedRoute allowedRoles={["manager", "admin"]} />,
    children: [
      {
        path: "/team-leaves",
        element: <TeamLeavesPage />,
      },
    ],
  },

  // Admin Routes
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/users/create",
        element: <CreateUserPage />,
      },
      {
        path: "/users/edit/:id",
        element: <EditUserPage />,
      },
      {
        path: "/leave-types",
        element: <LeaveTypesPage />,
      },
      {
        path: "/leave-types/create",
        element: <CreateLeaveTypePage />,
      },
      {
        path: "/leave-types/edit/:id",
        element: <EditLeaveTypePage />,
      },
      {
        path: "/holidays",
        element: <HolidaysPage />,
      },
      {
        path: "/holidays/create",
        element: <CreateHolidayPage />,
      },
      {
        path: "/holidays/edit/:id",
        element: <EditHolidayPage />,
      },
      {
        path: "/leave-balances",
        element: <LeaveBalancesPage />,
      },
      {
        path: "/approval-workflows",
        element: <ApprovalWorkflowsPage />,
      },
      {
        path: "/approval-workflows/create",
        element: <CreateApprovalWorkflowPage />,
      },
      {
        path: "/approval-workflows/edit/:id",
        element: <EditApprovalWorkflowPage />,
      },
    ],
  },

  // Fallback Route
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
