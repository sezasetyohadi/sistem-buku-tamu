'use client';

import React from 'react';

import Modal from './Modal';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export default function TokenModal({ isOpen, onClose, token }: TokenModalProps) {
  // Format token to 14 digits
  const formattedToken = token ? token.substring(0, 15) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Berhasil! 🎉"
      size="sm"
    >
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-700">
            Selamat datang di DISNAKERTRANS Jawa Tengah
          </p>
          
          <div className="bg-gray-100 p-4 rounded-lg my-4">
            <p className="text-gray-500 text-sm mb-1">Token anda</p>
            <p className="text-xl font-bold text-gray-800 tracking-wider">{formattedToken}</p>
          </div>
          
          <p className="text-gray-500 text-sm">
            Cek di laman status pengajuan
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}