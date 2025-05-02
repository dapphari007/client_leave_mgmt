import { get, post, put } from './api';
import { ApiResponse, CreateLeaveRequestData, LeaveRequest, UpdateLeaveRequestStatusData } from '../types';

export interface GetLeaveRequestsParams {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  year?: number;
}

export interface GetLeaveRequestsResponse {
  leaveRequests: LeaveRequest[];
  count: number;
}

export const createLeaveRequest = async (data: CreateLeaveRequestData): Promise<ApiResponse<LeaveRequest>> => {
  return post<ApiResponse<LeaveRequest>>('/leave-requests', data);
};

export const getMyLeaveRequests = async (params?: GetLeaveRequestsParams): Promise<GetLeaveRequestsResponse> => {
  return get<GetLeaveRequestsResponse>('/leave-requests/my-requests', { params });
};

export const getTeamLeaveRequests = async (params?: GetLeaveRequestsParams): Promise<GetLeaveRequestsResponse> => {
  return get<GetLeaveRequestsResponse>('/leave-requests/team-requests', { params });
};

export const getLeaveRequest = async (id: string): Promise<ApiResponse<LeaveRequest>> => {
  return get<ApiResponse<LeaveRequest>>(`/leave-requests/${id}`);
};

export const updateLeaveRequestStatus = async (id: string, data: UpdateLeaveRequestStatusData): Promise<ApiResponse<LeaveRequest>> => {
  return put<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/status`, data);
};

export const cancelLeaveRequest = async (id: string): Promise<ApiResponse<LeaveRequest>> => {
  return put<ApiResponse<LeaveRequest>>(`/leave-requests/${id}/cancel`);
};