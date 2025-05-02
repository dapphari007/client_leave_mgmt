import { useQuery } from "@tanstack/react-query";
import { getLeaveTypes, getLeaveType } from "../services/leaveTypeService";

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => getLeaveTypes(),
  });
};

export const useLeaveType = (id: string | undefined) => {
  return useQuery({
    queryKey: ["leaveType", id],
    queryFn: () => getLeaveType(id as string),
    enabled: !!id,
  });
};
