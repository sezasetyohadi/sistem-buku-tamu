'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Metadata } from 'next';
import { useState, useEffect, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';

import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';

import PdfReport from './PdfReport';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Note: For client components, we handle metadata differently
// The metadata will be set in the layout.tsx instead

interface ReportsData {
  metrics: {
    totalVisits: { value: number; growth: number; label: string };
    dailyAverage: { value: number; growth: number; label: string };
    avgDuration: { value: string; growth: number; label: string };
  };
  weeklyTrends: Array<{ date: string; visits: number }>;
  serviceCategories: Array<{ category: string; count: number; percentage: number }>;
  topVisitors: Array<{ nama: string; asal_instansi: string; visit_count: number }>;
  recentActivities: Array<{
    id: number;
    nama: string;
    asal_instansi: string;
    keperluan: string;
    tanggapan: string;
    waktu_dibuat: string;
  }>;
}

// Contoh data, ganti dengan data asli dari state/props
const dummyData = {
  metrics: {
    totalVisits: { value: 120 },
    dailyAverage: { value: 17 },
    avgDuration: { value: '00:12:30' },
  },
  topVisitors: [
    { nama: 'Budi', asal_instansi: 'PT. Maju', visit_count: 5 },
    { nama: 'Siti', asal_instansi: 'CV. Jaya', visit_count: 4 },
  ],
  recentActivities: [
    {
      nama: 'Budi',
      asal_instansi: 'PT. Maju',
      keperluan: 'Survei',
      tanggapan: 'Diterima',
      waktu_dibuat: new Date().toISOString(),
    },
  ],
};

export default function AdminReportsAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // Default 7 days
  const [filterByDepartment, setFilterByDepartment] = useState(true); // Default to filter by department
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: number, bidang: string }>>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  
  const pdfRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if the user can access all departments (based on bidang_tujuan_id)
  const canAccessAllDepartments = user?.bidang_tujuan_id === 999;
  
  // Only apply department filter for users with specific department
  const bidangTujuanId = selectedDepartment || (!canAccessAllDepartments ? user?.bidang_tujuan_id : null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target as Node)) {
        setIsDepartmentDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch departments list
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/lookup');
        const result = await response.json();
        
        if (result.success && result.data.bidangTujuan) {
          setDepartmentsList(result.data.bidangTujuan);
          
          // For users with specific department, force select their department and don't allow changes
          if (user?.bidang_tujuan_id && user.bidang_tujuan_id !== 999) {
            //console.log('Reports: Auto-selecting department for user:', user.bidang_tujuan_id);
            setSelectedDepartment(user.bidang_tujuan_id);
          }
        }
      } catch (err) {
        console.error('Error fetching departments list:', err);
      }
    };

    fetchDepartments();
  }, [user]);
  
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // Add department filter if a department is selected
        const departmentParam = bidangTujuanId ? `&bidangTujuanId=${bidangTujuanId}` : '';
        const url = `/api/reports?period=${selectedPeriod}${departmentParam}`;
        
        //console.log('Reports: Fetching data from URL:', url);
        //console.log('Reports: Current user bidang_tujuan_id:', user?.bidang_tujuan_id);
        //console.log('Reports: Selected department:', selectedDepartment);
        //console.log('Reports: Computed bidangTujuanId:', bidangTujuanId);
        
        const response = await fetch(url);
        const result = await response.json();
        
        //console.log('Reports: API response:', result);
        //console.log('Reports: API response data:', JSON.stringify(result.data, null, 2));
        
        if (result.success) {
          //console.log('Reports: Setting data state:', result.data);
          //console.log('Reports: Statistics in data:', result.data?.statistics);
          //console.log('Reports: Recent activities count:', result.data?.recentActivities?.length);
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch reports data');
        }
      } catch (err) {
        setError('Network error while fetching reports data');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [selectedPeriod, selectedDepartment, bidangTujuanId]);

  const handleExportPDF = async () => {
    if (!pdfRef.current) {
      showToast.warning('PDF content not ready. Please try again.');
      return;
    }
    
    try {
      const element = pdfRef.current;
      
      // Temporarily make the element visible for canvas capture
      const originalStyle = {
        position: element.style.position,
        left: element.style.left,
        visibility: element.style.visibility,
        zIndex: element.style.zIndex
      };
      
      // Move element into view temporarily but keep it hidden from users
      element.style.position = 'fixed';
      element.style.left = '0px';
      element.style.top = '0px';
      element.style.visibility = 'visible';
      element.style.zIndex = '-1000';
      
      // Force layout recalculation
      element.offsetHeight;
      
      // Wait a moment for content to finish rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error(`Element has zero dimensions: ${rect.width}x${rect.height}`);
      }
      
      // Create canvas with the element's actual dimensions
      const canvas = await html2canvas(element, { 
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        foreignObjectRendering: false, // Faster rendering
        imageTimeout: 15000,
        removeContainer: true
      });
      
      // Restore original styles immediately
      element.style.position = originalStyle.position;
      element.style.left = originalStyle.left;
      element.style.visibility = originalStyle.visibility;
      element.style.zIndex = originalStyle.zIndex;
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error(`Canvas has zero dimensions: ${canvas.width}x${canvas.height}`);
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      
      if (!imgData || imgData === 'data:,' || imgData.length < 100) {
        throw new Error('Failed to generate valid image data from canvas');
      }
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If image is too tall, scale it down to fit the page
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      if (imgHeight > pageHeight - 40) {
        finalHeight = pageHeight - 40;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }
      
      pdf.addImage(imgData, 'JPEG', 20, 20, finalWidth, finalHeight);
      
      // Create filename with department and period info
      const periodText = selectedPeriod === '7' ? '7Hari' : 
                        selectedPeriod === '30' ? '30Hari' : 
                        selectedPeriod === '90' ? '3Bulan' : 
                        selectedPeriod === '180' ? '6Bulan' : '1Tahun';
      
      let departmentText = 'AllBidang';
      
      if (selectedDepartment) {
        // Get selected department name and clean it up for the filename
        const deptName = departmentsList.find(dept => dept.id === selectedDepartment)?.bidang || 
                          user?.nama_bidang || 'Bidang';
        departmentText = deptName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
      } else if (canAccessAllDepartments && !selectedDepartment) {
        departmentText = 'Global';
      }
      
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `laporan-buku-tamu-${departmentText}-${periodText}-${dateStr}.pdf`;
      
      pdf.save(filename);
      
      showToast.success('PDF berhasil diekspor!');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast.error(`Gagal mengekspor PDF: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-lg shadow border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Reports</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-800">Laporan & Analitik</h1>
              </div>
              <p className="text-gray-800">
                Dashboard analitik Dalista
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {!selectedDepartment && !canAccessAllDepartments && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Menampilkan Data Semua Bidang
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-3 items-center">
              {/* Period filter - Styled as a dropdown button */}
              <div className="relative inline-block">
                <button 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center w-44"
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                >
                  <span className="truncate flex-1 text-left" title={selectedPeriod === '7' ? '7 Hari Terakhir' : 
                                                                selectedPeriod === '30' ? '30 Hari Terakhir' : 
                                                                selectedPeriod === '90' ? '3 Bulan Terakhir' : 
                                                                selectedPeriod === '180' ? '6 Bulan Terakhir' : 
                                                                '1 Tahun Terakhir'}>{selectedPeriod === '7' ? '7 Hari Terakhir' : 
                        selectedPeriod === '30' ? '30 Hari Terakhir' : 
                        selectedPeriod === '90' ? '3 Bulan Terakhir' : 
                        selectedPeriod === '180' ? '6 Bulan Terakhir' : 
                        '1 Tahun Terakhir'}</span>
                  <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown menu for time period */}
                {isTimeDropdownOpen && (
                  <div 
                    className="absolute z-10 mt-1 w-44 bg-white border border-gray-300 rounded-lg shadow-lg"
                    ref={timeDropdownRef}
                  >
                    <button 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedPeriod === '7' ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('7');
                        setIsTimeDropdownOpen(false);
                      }}
                    >
                      7 Hari Terakhir
                    </button>
                    <button 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedPeriod === '30' ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('30');
                        setIsTimeDropdownOpen(false);
                      }}
                    >
                      30 Hari Terakhir
                    </button>
                    <button 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedPeriod === '90' ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('90');
                        setIsTimeDropdownOpen(false);
                      }}
                    >
                      3 Bulan Terakhir
                    </button>
                    <button 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedPeriod === '180' ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('180');
                        setIsTimeDropdownOpen(false);
                      }}
                    >
                      6 Bulan Terakhir
                    </button>
                    <button 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedPeriod === '365' ? 'bg-blue-500 text-white' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('365');
                        setIsTimeDropdownOpen(false);
                      }}
                    >
                      1 Tahun Terakhir
                    </button>
                  </div>
                )}
              </div>
              
              {/* Department filter */}
              {canAccessAllDepartments ? (
                <div className="relative inline-block">
                  <button 
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center w-48"
                    onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  >
                    <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate text-left flex-1" 
                      title={selectedDepartment 
                        ? departmentsList.find(dept => dept.id === selectedDepartment)?.bidang || 'Bidang Terpilih' 
                        : 'Semua Bidang'}>
                      {selectedDepartment 
                        ? departmentsList.find(dept => dept.id === selectedDepartment)?.bidang || 'Bidang Terpilih' 
                        : 'Semua Bidang'}
                    </span>
                    <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isDepartmentDropdownOpen && (
                    <div 
                      className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      ref={departmentDropdownRef}
                    >
                      <button 
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedDepartment === null ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => {
                          setSelectedDepartment(null);
                          setIsDepartmentDropdownOpen(false);
                        }}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm0-4a1 1 0 100 2a1 1 0 000-2z" clipRule="evenodd" />
                          </svg>
                          <span>Semua Bidang</span>
                        </div>
                      </button>
                      
                      {departmentsList.map(dept => (
                        <button 
                          key={dept.id}
                          className={`block w-full text-left px-4 py-2 hover:bg-gray-100 truncate ${selectedDepartment === dept.id ? 'bg-blue-500 text-white' : ''}`}
                          onClick={() => {
                            setSelectedDepartment(dept.id);
                            setIsDepartmentDropdownOpen(false);
                          }}
                          title={dept.bidang}
                        >
                          {dept.bidang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <button 
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center w-48 cursor-default"
                    disabled
                  >
                    <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-700 font-medium truncate flex-1" title={user?.nama_bidang || 'Bidang Anda'}>
                      {user?.nama_bidang || 'Bidang Anda'}
                    </span>
                  </button>
                </div>
              )}
              
              {/* Export PDF Button */}
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 flex items-center"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                onClick={handleExportPDF}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow border" style={{ backgroundColor: '#EBF4FF', borderColor: '#BFDBFE' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Total Kunjungan</h3>
                <p className="text-3xl font-bold text-gray-900">{data?.metrics.totalVisits.value.toLocaleString() || '0'}</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <svg className={`w-4 h-4 mr-1 ${(data?.metrics.totalVisits.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={
                      (data?.metrics.totalVisits.growth || 0) >= 0 
                        ? 'M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z'
                        : 'M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z'
                    } clipRule="evenodd"/>
                  </svg>
                  {data?.metrics.totalVisits.label || 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3D5DC3, #2563EB)' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{ backgroundColor: '#FEF3E2', borderColor: '#FED7AA' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Rata-rata Harian</h3>
                <p className="text-3xl font-bold text-gray-900">{data?.metrics.dailyAverage.value || '0'}</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <svg className={`w-4 h-4 mr-1 ${(data?.metrics.dailyAverage.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={
                      (data?.metrics.dailyAverage.growth || 0) >= 0 
                        ? 'M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z'
                        : 'M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z'
                    } clipRule="evenodd"/>
                  </svg>
                  {data?.metrics.dailyAverage.label || 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F29442, #EA580C)' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586L14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow border" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Waktu Rata-rata</h3>
                <p className="text-3xl font-bold text-gray-900">{data?.metrics.avgDuration.value || '0h'}</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <svg className={`w-4 h-4 mr-1 ${(data?.metrics.avgDuration.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={
                      (data?.metrics.avgDuration.growth || 0) >= 0 
                        ? 'M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z'
                        : 'M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z'
                    } clipRule="evenodd"/>
                  </svg>
                  {data?.metrics.avgDuration.label || 'No data'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>


        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Visitor Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586L14.586 7H12z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Tren Kunjungan ({selectedPeriod === '7' ? '7 Hari Terakhir' : 
                                 selectedPeriod === '30' ? '30 Hari Terakhir' :
                                 selectedPeriod === '90' ? '3 Bulan Terakhir' : 
                                 selectedPeriod === '180' ? '6 Bulan Terakhir' : '1 Tahun Terakhir'})
              </h3>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              {data?.weeklyTrends && data.weeklyTrends.length > 0 ? (
                <Line
                  data={{
                    labels: data.weeklyTrends.map(item => {
                      const date = new Date(item.date);
                      return date.toLocaleDateString('id-ID', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }),
                    datasets: [
                      {
                        label: 'Kunjungan',
                        data: data.weeklyTrends.map(item => item.visits),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                          label: function (context: any) {
                            return `${context.parsed.y} kunjungan`;
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: '#6B7280',
                          font: {
                            size: 12,
                          },
                        },
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          color: '#6B7280',
                          font: {
                            size: 12,
                          },
                          stepSize: 1,
                        },
                      },
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index' as const,
                    },
                  }}
                />
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-gray-600">Tidak ada data trend</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Categories */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Kategori Layanan Populer</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              {data?.serviceCategories && data.serviceCategories.length > 0 ? (
                <Pie
                  data={{
                    labels: data.serviceCategories.map((cat: any) => cat.category || 'Tidak Kategori'),
                    datasets: [
                      {
                        label: 'Kategori Layanan',
                        data: data.serviceCategories.map((cat: any) => cat.count),
                        backgroundColor: [
                          '#3D5DC3',
                          '#22C55E',
                          '#F29442',
                          '#8B5CF6',
                          '#EF4444',
                        ],
                        borderColor: [
                          '#2563EB',
                          '#16A34A',
                          '#EA580C',
                          '#7C3AED',
                          '#DC2626',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                        labels: {
                          padding: 15,
                          font: {
                            size: 12,
                          },
                          generateLabels: (chart) => {
                            const datasets = chart.data.datasets;
                            if (datasets.length === 0) return [];
                            
                            const data = datasets[0].data as number[];
                            const labels = chart.data.labels as string[];
                            const backgroundColor = datasets[0].backgroundColor as string[];
                            
                            const total = data.reduce((acc: number, val: number) => acc + val, 0);
                            
                            return labels.map((label, i) => {
                              const value = data[i];
                              const percentage = ((value / total) * 100).toFixed(1);
                              return {
                                text: `${label}: ${percentage}%`,
                                fillStyle: backgroundColor[i],
                                hidden: false,
                                index: i,
                              };
                            });
                          },
                        },
                        onClick: () => {
                          return false;
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = (context.dataset.data as number[]).reduce(
                              (acc: number, val: number) => acc + val,
                              0
                            );
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <p className="text-gray-500">Belum ada data kategori layanan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Top Visitors */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Aktivitas Terbaru</h3>
            </div>
            <div className="space-y-4">
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, i) => {
                  const activityTime = new Date(activity.waktu_dibuat).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const activityType = activity.tanggapan === 'Datang' ? 'in' : activity.tanggapan === 'Selesai' ? 'out' : 'request';
                  const activityAction = activity.tanggapan === 'Datang' ? 'Check-in' : activity.tanggapan === 'Selesai' ? 'Check-out' : 'Permohonan Baru';

                  return (
                    <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${
                        activityType === 'in' ? 'bg-green-500' :
                        activityType === 'out' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}>
                        {activityType === 'in' ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                          </svg>
                        ) : activityType === 'out' ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L5.414 10H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 11-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activityAction}</p>
                        <p className="text-xs text-gray-800">{activity.nama} - {activity.asal_instansi}</p>
                      </div>
                      <span className="text-xs text-gray-700">{activityTime}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Visitors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-gray-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Tamu Paling Aktif</h3>
            </div>
            <div className="space-y-4">
              {data?.topVisitors && data.topVisitors.length > 0 ? (
                data.topVisitors.map((visitor, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' :
                      i === 1 ? 'bg-gray-400' :
                      i === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #3D5DC3, #2563EB)' }}>
                      {visitor.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{visitor.nama}</p>
                      <p className="text-xs text-gray-800">{visitor.asal_instansi}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{visitor.visit_count}</span>
                      <p className="text-xs text-gray-700">kali</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <p className="text-gray-500">Belum ada data tamu berulang</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konten PDF tersembunyi */}
        <div style={{
          position: 'relative',
          left: '0px',
          top: '0',
          visibility: 'visible',
          margin: '20px 0'
        }}>
          <div ref={pdfRef} data-pdf-content style={{ 
            width: '794px',  // A4 width in pixels at 96 DPI
            minHeight: '1123px', // A4 height in pixels at 96 DPI
            padding: '40px',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif'
          }}>
            <PdfReport 
              data={data && data.metrics ? data : dummyData}
              departmentName={
                selectedDepartment 
                  ? departmentsList.find(dept => dept.id === selectedDepartment)?.bidang || user?.nama_bidang || 'Bidang Terpilih'
                  : 'Semua Bidang'
              }
              filteredByDepartment={!!selectedDepartment}
              selectedPeriod={selectedPeriod}
              periodLabel={
                selectedPeriod === '7' ? '7 Hari Terakhir' : 
                selectedPeriod === '30' ? '30 Hari Terakhir' : 
                selectedPeriod === '90' ? '3 Bulan Terakhir' : 
                selectedPeriod === '180' ? '6 Bulan Terakhir' : 
                '1 Tahun Terakhir'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
