import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthUser, UpdateProfileData, User, LoginCredentials } from "../types";
import {
  getProfile,
  login,
  LoginResponse,
  updateProfile,
} from "../services/authService";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: AuthUser | null;
  userProfile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  updateUserProfile: (data: UpdateProfileData) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Check if token is expired
          const decodedToken: any = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            // Token is expired
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setUserProfile(null);
          } else {
            // Token is valid
            setUser(JSON.parse(storedUser));

            // Fetch full user profile
            try {
              const response = await getProfile();
              if (response.user) {
                setUserProfile(response.user);
              }
            } catch (error) {
              console.error("Failed to fetch user profile:", error);
            }
          }
        } catch (error) {
          // Invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setUserProfile(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    const response = await login(credentials);

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));

    setUser(response.user);

    // Fetch full user profile
    try {
      const profileResponse = await getProfile();
      if (profileResponse.user) {
        setUserProfile(profileResponse.user);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }

    return response;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserProfile(null);
  };

  const handleUpdateProfile = async (
    data: UpdateProfileData
  ): Promise<User> => {
    const response = await updateProfile(data);

    if (response.user) {
      setUserProfile(response.user);

      // Update the basic user info in localStorage
      if (user) {
        const updatedUser: AuthUser = {
          ...user,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return response.user;
    }

    throw new Error("Failed to update profile");
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await getProfile();
      if (response.user) {
        setUserProfile(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    updateUserProfile: handleUpdateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
