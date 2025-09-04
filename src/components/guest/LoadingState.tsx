"use client";

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Memuat survey..." }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
