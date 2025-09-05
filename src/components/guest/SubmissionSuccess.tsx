"use client";

import React from 'react';

interface SubmissionSuccessProps {
  resetForm: () => void;
}

export default function SubmissionSuccess({ resetForm }: SubmissionSuccessProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Terima Kasih!
      </h2>
      <p className="text-gray-600 mb-6">
        Survey Anda telah berhasil dikirim. Masukan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami.
      </p>
      <button
        onClick={resetForm}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Isi Survey Lagi
      </button>
    </div>
  );
}
