import { get, post, put, del } from "./api";
import { LeaveBalance } from "../types";

export interface GetLeaveBalancesParams {
  year?: number;
  userId?: string;
}

export interface GetLeaveBalancesResponse {
  leaveBalances: LeaveBalance[];
  count: number;
}

export interface CreateLeaveBalanceData {
  userId: string;
  leaveTypeId: string;
  totalDays: number;
  year: number;
}

export interface BulkCreateLeaveBalanceData {
  leaveTypeId: string;
  totalDays: number;
  year: number;
}

export interface UpdateLeaveBalanceData {
  totalDays?: number;
  adjustmentReason?: string;
}

export const getMyLeaveBalances = async (
  params?: GetLeaveBalancesParams
): Promise<GetLeaveBalancesResponse> => {
  return get<GetLeaveBalancesResponse>("/leave-balances/my-balances", {
    params,
  });
};

export const getUserLeaveBalances = async (
  userId: string,
  params?: GetLeaveBalancesParams
): Promise<GetLeaveBalancesResponse> => {
  return get<GetLeaveBalancesResponse>(`/leave-balances/user/${userId}`, {
    params,
  });
};

export const getAllLeaveBalances = async (
  params?: GetLeaveBalancesParams
): Promise<LeaveBalance[]> => {
  const response = await get<{ leaveBalances: LeaveBalance[]; count: number }>(
    "/leave-balances",
    { params }
  );
  return response.leaveBalances || [];
};

export const getLeaveBalanceById = async (
  id: string
): Promise<LeaveBalance> => {
  const response = await get<{ leaveBalance: LeaveBalance }>(
    `/leave-balances/${id}`
  );
  return response.leaveBalance;
};

export const createLeaveBalance = async (
  data: CreateLeaveBalanceData
): Promise<LeaveBalance> => {
  const response = await post<{ leaveBalance: LeaveBalance }>(
    "/leave-balances",
    data
  );
  return response.leaveBalance;
};

export const updateLeaveBalance = async (
  id: string,
  data: UpdateLeaveBalanceData
): Promise<LeaveBalance> => {
  const response = await put<{ leaveBalance: LeaveBalance }>(
    `/leave-balances/${id}`,
    data
  );
  return response.leaveBalance;
};

export const deleteLeaveBalance = async (id: string): Promise<void> => {
  await del(`/leave-balances/${id}`);
};

export const bulkCreateLeaveBalances = async (
  data: BulkCreateLeaveBalanceData
): Promise<LeaveBalance[]> => {
  const response = await post<{ leaveBalances: LeaveBalance[] }>(
    "/leave-balances/bulk-create",
    data
  );
  return response.leaveBalances || [];
};
