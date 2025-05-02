import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyLeaveRequests, cancelLeaveRequest } from '../../services/leaveRequestService';
import { LeaveRequest } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { formatDate } from '../../utils/dateUtils';
import { getErrorMessage } from '../../utils/errorUtils';

const MyLeavesPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch leave requests
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myLeaveRequests', selectedYear, selectedStatus],
    queryFn: () => getMyLeaveRequests({
      year: selectedYear,
      status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    }),
    onError: (err: any) => setError(getErrorMessage(err)),
  });

  // Handle cancel leave request
  const handleCancelRequest = async (id: string) => {
    try {
      await cancelLeaveRequest(id);
      setSuccessMessage('Leave request cancelled successfully');
      refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Helper function to render leave status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate year options for filter
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Leave Requests</h1>
        <Link to="/apply-leave">
          <Button>Apply for Leave</Button>
        </Link>
      </div>

      {error && (
        <Alert 
          variant="error" 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-6"
        />
      )}

      {successMessage && (
        <Alert 
          variant="success" 
          message={successMessage} 
          onClose={() => setSuccessMessage(null)} 
          className="mb-6"
        />
      )}

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.leaveRequests && data.leaveRequests.length > 0 ? (
            data.leaveRequests.map((request: LeaveRequest) => (
              <Card key={request.id}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.leaveType?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Duration:</span> {request.numberOfDays} day(s)
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Type:</span> {request.requestType.replace('_', ' ')}
                    </p>
                    {request.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    )}
                    {request.approverComments && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Comments:</span> {request.approverComments}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {renderStatusBadge(request.status)}
                    {request.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No leave requests found for the selected filters.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeavesPage;