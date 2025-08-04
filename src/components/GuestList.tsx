"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
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

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchGuests = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/guests');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch guests');
      }
      
      setGuests(result.data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckout = async (id: number) => {
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'PATCH',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to check out guest');
      }
      
      // Update the guest in the list
      setGuests(prevGuests => prevGuests.map(guest => {
        if (guest.id === id) {
          return { ...guest, check_out: new Date().toISOString() };
        }
        return guest;
      }));
    } catch (error) {
      console.error('Error checking out guest:', error);
      alert(error instanceof Error ? error.message : 'Failed to check out guest');
    }
  };
  
  useEffect(() => {
    fetchGuests();
  }, []);
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Loading guests...</div>;
  }
  
  if (error) {
    return (
      <div className="my-8 p-4 bg-red-100 text-red-700 rounded-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button 
          variant="secondary" 
          onClick={fetchGuests}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (guests.length === 0) {
    return <div className="text-center my-8">No guests have registered yet.</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Guest List</h2>
        <Button onClick={fetchGuests} size="sm">
          Refresh
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Purpose</th>
              <th className="py-3 px-4 text-left">Check In</th>
              <th className="py-3 px-4 text-left">Check Out</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {guests.map((guest) => (
              <tr key={guest.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{guest.name}</td>
                <td className="py-3 px-4">{guest.email}</td>
                <td className="py-3 px-4">{guest.purpose}</td>
                <td className="py-3 px-4">{formatDate(guest.check_in)}</td>
                <td className="py-3 px-4">
                  {guest.check_out ? formatDate(guest.check_out) : 'Not checked out'}
                </td>
                <td className="py-3 px-4">
                  {!guest.check_out && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleCheckout(guest.id)}
                    >
                      Check Out
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
