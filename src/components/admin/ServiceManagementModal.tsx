"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface Service {
  id: number;
  tujuan: string;
}

interface ServiceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded?: () => void;
}

export default function ServiceManagementModal({
  isOpen,
  onClose,
  onServiceAdded
}: ServiceManagementModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success) {
        setServices(result.data || []);
      } else {
        setError(result.message || 'Gagal mengambil data layanan');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Terjadi kesalahan saat mengambil data layanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      toast.error('Nama layanan harus diisi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tujuan: newServiceName.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Layanan berhasil ditambahkan');
        setNewServiceName('');
        await fetchServices();
        onServiceAdded?.();
      } else {
        toast.error(result.message || 'Gagal menambahkan layanan');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Terjadi kesalahan saat menambahkan layanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = async () => {
    if (!editingService || !editingService.tujuan.trim()) {
      toast.error('Nama layanan harus diisi');
      return;
    }

    // Prevent editing of system reserved service
    if (editingService.id === 999) {
      toast.error('Layanan sistem tidak dapat diubah');
      setEditingService(null);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingService.id,
          tujuan: editingService.tujuan.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Layanan berhasil diperbarui');
        setEditingService(null);
        await fetchServices();
        onServiceAdded?.();
      } else {
        toast.error(result.message || 'Gagal memperbarui layanan');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Terjadi kesalahan saat memperbarui layanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (service: Service) => {
    // Prevent deletion of system reserved service
    if (service.id === 999) {
      toast.error('Layanan sistem tidak dapat dihapus');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${service.tujuan}"?`)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/services?id=${service.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Layanan berhasil dihapus');
        await fetchServices();
        onServiceAdded?.();
      } else {
        toast.error(result.message || 'Gagal menghapus layanan');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Terjadi kesalahan saat menghapus layanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewServiceName('');
    setEditingService(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manajemen Layanan" size="lg">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add New Service */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Layanan Baru</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Masukkan nama layanan"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isSubmitting}
              onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
            />
            <button
              onClick={handleAddService}
              disabled={isSubmitting || !newServiceName.trim()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{isSubmitting ? 'Menambah...' : 'Tambah'}</span>
            </button>
          </div>
        </div>

        {/* Services List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Layanan</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : services.filter(service => service.id !== 999).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Belum ada layanan yang tersedia</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {services.filter(service => service.id !== 999).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {editingService?.id === service.id ? (
                    <div className="flex-1 flex items-center space-x-3">
                      <input
                        type="text"
                        value={editingService.tujuan}
                        onChange={(e) => setEditingService({ ...editingService, tujuan: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        disabled={isSubmitting}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditService()}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditService}
                          disabled={isSubmitting}
                          className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                          title="Simpan"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingService(null)}
                          disabled={isSubmitting}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                          title="Batal"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center flex-1">
                        <span className="text-sm font-medium text-gray-900 mr-2">#{service.id}</span>
                        <span className="text-gray-700">{service.tujuan}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingService(service)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
