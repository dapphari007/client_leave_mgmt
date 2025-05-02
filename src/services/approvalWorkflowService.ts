import api from './api';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: ApprovalStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  order: number;
  approverType: 'manager' | 'hr' | 'department_head' | 'specific_user';
  approverId?: string; // Used when approverType is 'specific_user'
  required: boolean;
}

export const createApprovalWorkflow = async (workflowData: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post('/api/approval-workflows', workflowData);
  return response.data;
};

export const getAllApprovalWorkflows = async () => {
  const response = await api.get('/api/approval-workflows');
  return response.data;
};

export const getApprovalWorkflowById = async (id: string) => {
  const response = await api.get(`/api/approval-workflows/${id}`);
  return response.data;
};

export const updateApprovalWorkflow = async (id: string, workflowData: Partial<Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const response = await api.put(`/api/approval-workflows/${id}`, workflowData);
  return response.data;
};

export const deleteApprovalWorkflow = async (id: string) => {
  const response = await api.delete(`/api/approval-workflows/${id}`);
  return response.data;
};