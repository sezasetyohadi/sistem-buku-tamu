import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import Modal from '../ui/Modal';

interface CheckinInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bidangTujuanId: number, asnDituju: string, caraSalinan?: number[]) => void;
  guestName: string;
  isLoading?: boolean;
}

interface BidangTujuan {
  id: number;
  bidang: string;
}

interface CaraMendapatkanSalinan {
  id: number;
  nama_opsi: string;
}

export default function CheckinInfoModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  guestName,
  isLoading = false 
}: CheckinInfoModalProps) {
  const [bidangTujuanList, setBidangTujuanList] = useState<BidangTujuan[]>([]);
  const [caraSalinanList, setCaraSalinanList] = useState<CaraMendapatkanSalinan[]>([]);
  const [selectedBidangId, setSelectedBidangId] = useState<number>(0);
  const [asnDituju, setAsnDituju] = useState('');
  const [selectedCaraSalinan, setSelectedCaraSalinan] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch bidang tujuan list
  useEffect(() => {
    const fetchLookupData = async () => {
      if (!isOpen) return;
      
      setIsLoadingData(true);
      try {
        const response = await fetch('/api/lookup');
        const result = await response.json();
        
        //console.log('Lookup API response:', result);
        
        if (result.success) {
          const bidangData = result.data.bidangTujuan || [];
          const salinanData = result.data.mendapatkanSalinan || [];
          
          //console.log('Bidang Tujuan data:', bidangData);
          //console.log('Cara Mendapatkan Salinan data:', salinanData);
          
          setBidangTujuanList(bidangData);
          setCaraSalinanList(salinanData);
        } else {
          console.error('Failed to fetch lookup data:', result.message);
          toast.error('Gagal memuat data dropdown');
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
        toast.error('Gagal memuat data dropdown');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLookupData();
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBidangId(0);
      setAsnDituju('');
      setSelectedCaraSalinan([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleCaraSalinanChange = (caraSalinanId: number, checked: boolean) => {
    //console.log('Checkbox changed:', { caraSalinanId, checked, currentCaraSalinan: selectedCaraSalinan });
    
    setSelectedCaraSalinan(prev => {
      let newState;
      if (checked) {
        // Add to array if not already present
        newState = prev.includes(caraSalinanId) ? prev : [...prev, caraSalinanId];
      } else {
        // Remove from array
        newState = prev.filter(id => id !== caraSalinanId);
      }
      //console.log('State transition:', { prev, newState, caraSalinanId, checked });
      return newState;
    });
    
    // Force re-render by updating a dummy state
    setTimeout(() => {
      //console.log('Current selectedCaraSalinan after update:', selectedCaraSalinan);
    }, 100);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedBidangId || selectedBidangId === 0) {
      newErrors.bidangTujuan = 'Bidang tujuan harus dipilih';
    }

    if (!asnDituju.trim()) {
      newErrors.asnDituju = 'ASN yang ditemui harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedBidangId, asnDituju.trim(), selectedCaraSalinan.length > 0 ? selectedCaraSalinan : undefined);
    } catch (error) {
      console.error('Error in checkin info submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Menandai Tamu Datang"
      size="lg"
    >
      <div className="space-y-6">
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Bidang Tujuan */}
          <div>
            <label htmlFor="bidangTujuan" className="block text-sm font-medium text-gray-700 mb-2">
              Bidang Tujuan <span className="text-red-500">*</span>
            </label>
            <select
              id="bidangTujuan"
              value={selectedBidangId}
              onChange={(e) => setSelectedBidangId(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.bidangTujuan ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting || isLoading || isLoadingData}
            >
              <option value={0}>
                {isLoadingData ? 'Memuat data...' : 'Pilih Bidang Tujuan'}
              </option>
              {bidangTujuanList.map((bidang) => (
                <option key={bidang.id} value={bidang.id}>
                  {bidang.bidang}
                </option>
              ))}
            </select>
            {errors.bidangTujuan && (
              <p className="mt-1 text-sm text-red-600">{errors.bidangTujuan}</p>
            )}
          </div>

          {/* Menemui (ASN) */}
          <div>
            <label htmlFor="asnDituju" className="block text-sm font-medium text-gray-700 mb-2">
              Menemui (ASN) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="asnDituju"
              value={asnDituju}
              onChange={(e) => setAsnDituju(e.target.value)}
              placeholder="Nama ASN yang ditemui"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.asnDituju ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting || isLoading || isLoadingData}
            />
            {errors.asnDituju && (
              <p className="mt-1 text-sm text-red-600">{errors.asnDituju}</p>
            )}
          </div>

          {/* Cara Mendapatkan Salinan (Opsional) */}
          <div>
            <div className="flex items-center mb-3">
              <label className="text-sm font-medium text-gray-700">
                Cara Mendapatkan Salinan
              </label>
              <span className="ml-2 text-sm text-gray-500">(Opsional)</span>
            </div>
            <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
              {isLoadingData ? (
                <div className="text-sm text-gray-500">Memuat data cara mendapatkan salinan...</div>
              ) : caraSalinanList.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Tidak ada data cara mendapatkan salinan</p>
              ) : (
                <div className="space-y-2">
                  {caraSalinanList.map((cara) => {
                    const isSelected = selectedCaraSalinan.includes(cara.id);
                    
                    return (
                      <div key={`salinan-option-${cara.id}`} className="flex items-center hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200">
                        <div 
                          className={`
                            flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200
                            ${isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-gray-300 hover:border-blue-500'
                            }
                          `}
                          onClick={() => {
                            if (!isSubmitting && !isLoading && !isLoadingData) {
                              handleCaraSalinanChange(cara.id, !isSelected);
                            }
                          }}
                        >
                          {isSelected && (
                            <svg 
                              className="w-3 h-3 text-white" 
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          )}
                        </div>
                        <label 
                          className="ml-3 text-sm text-gray-700 cursor-pointer select-none flex-1 font-medium"
                          onClick={() => {
                            if (!isSubmitting && !isLoading && !isLoadingData) {
                              handleCaraSalinanChange(cara.id, !isSelected);
                            }
                          }}
                        >
                          {cara.nama_opsi}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isLoading || isLoadingData}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || isLoadingData}
            className="px-4 py-2 bg-green-200 text-green-800 rounded-md hover:bg-green-300 transition-colors disabled:bg-green-100 disabled:text-green-500 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              'Tandai Datang'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}