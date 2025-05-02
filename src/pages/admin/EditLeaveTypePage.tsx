import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { updateLeaveType } from '../../services/leaveTypeService';
import { useLeaveType } from '../../hooks';

type FormValues = {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  requiresApproval: boolean;
  allowsHalfDay: boolean;
  maxDaysPerRequest: number;
  minDaysPerRequest: number;
  advanceNoticeDays: number;
};

export default function EditLeaveTypePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const { data: leaveType, isLoading: isLoadingLeaveType } = useLeaveType(id);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6', // Default blue color
      icon: 'calendar',
      isActive: true,
      requiresApproval: true,
      allowsHalfDay: true,
      maxDaysPerRequest: 30,
      minDaysPerRequest: 1,
      advanceNoticeDays: 1
    }
  });
  
  useEffect(() => {
    if (leaveType) {
      reset({
        name: leaveType.name,
        description: leaveType.description || '',
        color: leaveType.color || '#3B82F6',
        icon: leaveType.icon || 'calendar',
        isActive: leaveType.isActive,
        requiresApproval: leaveType.requiresApproval,
        allowsHalfDay: leaveType.allowsHalfDay,
        maxDaysPerRequest: leaveType.maxDaysPerRequest || 30,
        minDaysPerRequest: leaveType.minDaysPerRequest || 1,
        advanceNoticeDays: leaveType.advanceNoticeDays || 1
      });
    }
  }, [leaveType, reset]);
  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<FormValues>) => 
      updateLeaveType(id as string, data),
    onSuccess: () => {
      navigate('/leave-types');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update leave type');
    }
  });
  
  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };
  
  if (isLoadingLeaveType) {
    return <div className="flex justify-center items-center h-64">Loading leave type data...</div>;
  }
  
  if (!leaveType && !isLoadingLeaveType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Leave type not found or you don't have permission to view it.
        </div>
        <button
          onClick={() => navigate('/leave-types')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Leave Types
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Leave Type</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Color
            </label>
            <input
              {...register('color')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="color"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Icon
            </label>
            <select
              {...register('icon')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="calendar">Calendar</option>
              <option value="beach">Beach</option>
              <option value="hospital">Hospital</option>
              <option value="home">Home</option>
              <option value="briefcase">Briefcase</option>
              <option value="graduation-cap">Education</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Minimum Days Per Request
            </label>
            <input
              {...register('minDaysPerRequest', { 
                valueAsNumber: true,
                min: {
                  value: 0.5,
                  message: 'Minimum days must be at least 0.5'
                }
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              step="0.5"
            />
            {errors.minDaysPerRequest && (
              <p className="text-red-500 text-xs italic">{errors.minDaysPerRequest.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Maximum Days Per Request
            </label>
            <input
              {...register('maxDaysPerRequest', { 
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: 'Maximum days must be at least 1'
                }
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
            />
            {errors.maxDaysPerRequest && (
              <p className="text-red-500 text-xs italic">{errors.maxDaysPerRequest.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Advance Notice Days
            </label>
            <input
              {...register('advanceNoticeDays', { 
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: 'Advance notice days cannot be negative'
                }
              })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
            />
            {errors.advanceNoticeDays && (
              <p className="text-red-500 text-xs italic">{errors.advanceNoticeDays.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Active</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('requiresApproval')}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Requires Approval</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('allowsHalfDay')}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Allows Half Day</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/leave-types')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}