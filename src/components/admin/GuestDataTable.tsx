'use client';

import React from 'react';

import { TableSkeleton, LoadingButton } from '@/components/ui/Loading';
import { LoadingWrapper } from '@/components/ui/LoadingState';
import { useApiCall, useMutation } from '@/hooks/useDataFetching';
import { showToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  purpose: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
}

export default function GuestDataTable() {
  // Use the new data fetching hook
  const {
    data: guests = [],
    loading: isLoading,
    error,
    refresh: fetchGuests,
  } = useApiCall<Guest[]>('/api/guests', {
    immediate: true,
    loadingKey: 'guests-table',
    retryAttempts: 2,
  });

  // Use mutation hook for checkout
  const { mutate: checkoutGuest, loading: checkoutLoading } = useMutation(
    async (guestId: number) => {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'PATCH',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to check out guest');
      }
      
      return result;
    },
    {
      onSuccess: () => {
        showToast.success('Guest checked out successfully');
        fetchGuests(); // Refresh the data
      },
      onError: (error) => {
        showToast.error(error.message || 'Failed to check out guest');
      },
      loadingKey: 'guest-checkout',
    }
  );

  const handleCheckout = async (id: number) => {
    await checkoutGuest(id);
  };

  return (
    <LoadingWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={!guests || guests.length === 0}
      loadingComponent={
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <TableSkeleton rows={5} columns={6} />
        </div>
      }
      errorComponent={
        <div className="container mx-auto p-4">
          <div className="my-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-red-800">Failed to load guests</p>
            </div>
            <p className="text-red-700 mb-4">{error?.message || 'An unknown error occurred'}</p>
            <LoadingButton 
              variant="secondary" 
              onClick={fetchGuests}
              isLoading={isLoading}
              loadingText="Retrying..."
            >
              Try Again
            </LoadingButton>
          </div>
        </div>
      }
      emptyComponent={
        <div className="container mx-auto p-4">
          <div className="text-center my-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guests yet</h3>
            <p className="text-gray-600 mb-4">No guests have registered yet. Check back later.</p>
            <LoadingButton 
              onClick={fetchGuests}
              isLoading={isLoading}
              loadingText="Refreshing..."
            >
              Refresh
            </LoadingButton>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Guest List</h2>
          <LoadingButton 
            onClick={fetchGuests} 
            size="sm"
            isLoading={isLoading}
            loadingText="Refreshing..."
          >
            Refresh
          </LoadingButton>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-gray-900">Name</th>
                <th className="py-3 px-4 text-left text-gray-900">Email</th>
                <th className="py-3 px-4 text-left text-gray-900">Purpose</th>
                <th className="py-3 px-4 text-left text-gray-900">Check In</th>
                <th className="py-3 px-4 text-left text-gray-900">Check Out</th>
                <th className="py-3 px-4 text-left text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests && guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{guest.name}</td>
                  <td className="py-3 px-4 text-gray-900">{guest.email}</td>
                  <td className="py-3 px-4 text-gray-900">{guest.purpose}</td>
                  <td className="py-3 px-4 text-gray-900">{formatDate(guest.check_in)}</td>
                  <td className="py-3 px-4 text-gray-900">
                    {guest.check_out ? formatDate(guest.check_out) : 'Not checked out'}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {!guest.check_out && (
                      <LoadingButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleCheckout(guest.id)}
                        isLoading={checkoutLoading}
                        loadingText="Checking out..."
                      >
                        Check Out
                      </LoadingButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LoadingWrapper>
  );
}
