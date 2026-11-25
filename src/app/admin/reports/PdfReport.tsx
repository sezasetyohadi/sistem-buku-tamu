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
import React from 'react';
import { Line, Pie } from 'react-chartjs-2';

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

interface PdfReportProps {
  data: any;
  departmentName?: string;
  filteredByDepartment?: boolean;
  selectedPeriod?: string;
  periodLabel?: string;
}

const PdfReport = ({ 
  data, 
  departmentName = 'Semua Bidang', 
  filteredByDepartment = false,
  selectedPeriod = '7',
  periodLabel = '7 Hari Terakhir'
}: PdfReportProps) => {
  // Ensure we always have some data to render
  const reportData = data || {
    metrics: {
      totalVisits: { value: 0, growth: 0, label: 'No data available' },
      dailyAverage: { value: 0, growth: 0, label: 'No data available' },
      avgDuration: { value: '0h', growth: 0, label: 'No data available' }
    },
    recentActivities: []
  };

  let activitiesToShow = reportData.recentActivities || [];
  if (activitiesToShow.length === 0) {
    activitiesToShow = [
      { 
        nama: 'Belum ada data', 
        asal_instansi: 'Belum ada data', 
        keperluan: 'Belum ada data', 
        tanggapan: 'Belum ada data', 
        waktu_dibuat: new Date().toISOString() 
      }
    ];
  }

  return (
    <>
      {/* Page 1: Header, Statistics, Line Chart, Daily Details */}
      <div data-pdf-page="1" style={{ 
        fontFamily: 'Arial, sans-serif', 
        fontSize: '12px', 
        color: '#333', 
        padding: '30px', 
        background: '#fff',
        minWidth: '794px',
        width: '794px',
        minHeight: '1123px',
        border: '1px solid #ddd',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
          <h1 style={{ margin: '0', fontSize: '22px', color: '#333', fontWeight: 'bold' }}>
            LAPORAN BUKU TAMU
          </h1>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#555', fontWeight: filteredByDepartment ? 'bold' : 'normal' }}>
            {filteredByDepartment ? `${departmentName}` : 'Semua Bidang'}
          </h2>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#444', fontWeight: 'normal' }}>
            Periode: {periodLabel}
          </h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
            Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* Statistics Table */}
        <div style={{ pageBreakInside: 'avoid' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
            Statistik Kunjungan
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Total Kunjungan</th>
              <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Rerata Tamu Harian</th>
              <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Waktu Rata-rata</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                {reportData.metrics?.totalVisits?.value ?? '0'}
              </td>
              <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                {reportData.metrics?.dailyAverage?.value ?? '0'}
              </td>
              <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', fontSize: '11px' }}>
                {reportData.metrics?.avgDuration?.value ?? '0h'}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Visitor Trends Chart */}
        <div style={{ pageBreakInside: 'avoid' }}>
        <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
          Tren Kunjungan ({periodLabel})
        </h3>
        <div style={{ width: '100%', height: '150px', marginBottom: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
          {reportData.weeklyTrends && reportData.weeklyTrends.length > 0 ? (
            <Line
              data={{
                labels: reportData.weeklyTrends.map((item: any) => {
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
                    data: reportData.weeklyTrends.map((item: any) => item.visits),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)', // Lighter background
                    borderWidth: 1.5, // Thinner border
                    fill: true,
                    tension: 0.2, // Less curve smoothing
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2, // Thicker point border
                    pointRadius: 4, // Bigger points
                    pointHoverRadius: 4, // Bigger hover
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable animations for PDF
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    enabled: false, // Disable tooltips for PDF
                  },
                },
                elements: {
                  point: {
                    radius: 4, // Bigger points
                    hoverRadius: 4,
                  },
                  line: {
                    borderWidth: 1, // Thinner lines
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#374151',
                      font: {
                        size: 9, // Smaller font
                      },
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)', // Lighter grid
                      lineWidth: 0.5, // Thinner grid lines
                    },
                    ticks: {
                      color: '#374151',
                      font: {
                        size: 9, // Smaller font
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0', fontSize: '14px' }}>Tidak ada data trend tersedia</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Data akan muncul setelah ada aktivitas kunjungan</p>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Daily Visit Details */}
        {reportData.weeklyTrends && reportData.weeklyTrends.length > 0 && (
          <div style={{ marginTop: '10px', marginBottom: '20px', padding: '12px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#333', fontWeight: 'bold' }}>Detail Kunjungan per Hari:</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '16px',
              rowGap: '5px',
              fontSize: '12px',
              color: '#555',
              lineHeight: '1.5'
            }}>
              {reportData.weeklyTrends.map((item: any, idx: number) => {
                const date = new Date(item.date);
                const formattedDate = date.toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
                return (
                  <div key={idx} style={{ pageBreakInside: 'avoid' }}>
                    <strong>{formattedDate}:</strong> {item.visits} kunjungan
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Page 2: All Pie Charts */}
      <div data-pdf-page="2" style={{ 
        fontFamily: 'Arial, sans-serif', 
        fontSize: '12px', 
        color: '#333', 
        padding: '30px', 
        background: '#fff',
        minWidth: '794px',
        width: '794px',
        minHeight: '1123px',
        border: '1px solid #ddd',
        boxSizing: 'border-box'
      }}>
        {/* Service Categories Pie Chart */}
        {reportData.serviceCategories && reportData.serviceCategories.length > 0 && (
          <div style={{ pageBreakInside: 'avoid' }}>
            <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
              Permintaan Layanan
            </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
            {/* Pie Chart */}
            <div style={{ width: '250px', height: '250px', flexShrink: 0 }}>
              <Pie
                data={{
                  labels: reportData.serviceCategories.map((cat: any) => cat.category || 'Tidak Kategori'),
                  datasets: [
                    {
                      label: 'Kategori Layanan',
                      data: reportData.serviceCategories.map((cat: any) => cat.count),
                      backgroundColor: [
                        '#3D5DC3',
                        '#22C55E',
                        '#F29442',
                        '#8B5CF6',
                        '#EF4444',
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: false,
                    },
                  },
                }}
              />
            </div>
            
            {/* Legend */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px' }}>
                {reportData.serviceCategories.map((category: any, idx: number) => {
                  const colors = ['#3D5DC3', '#22C55E', '#F29442', '#8B5CF6', '#EF4444'];
                  const total = reportData.serviceCategories.reduce((sum: number, cat: any) => sum + cat.count, 0);
                  const percentage = ((category.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        backgroundColor: colors[idx % colors.length],
                        marginRight: '10px',
                        borderRadius: '2px'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#333' }}>
                        <strong>{category.category || 'Tidak Kategori'}:</strong> {category.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layanan Diberikan Pie Chart */}
      {reportData.layananDiberikan && reportData.layananDiberikan.length > 0 && (
        <div style={{ pageBreakInside: 'avoid' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
            Layanan Diberikan
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
            {/* Pie Chart */}
            <div style={{ width: '250px', height: '250px', flexShrink: 0 }}>
              <Pie
                data={{
                  labels: reportData.layananDiberikan.map((layanan: any) => layanan.layanan_name || 'Belum terdata'),
                  datasets: [
                    {
                      label: 'Layanan Diberikan',
                      data: reportData.layananDiberikan.map((layanan: any) => layanan.count),
                      backgroundColor: [
                        '#10B981',
                        '#3B82F6',
                        '#F59E0B',
                        '#EF4444',
                        '#8B5CF6',
                        '#EC4899',
                        '#14B8A6',
                        '#F97316',
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: false,
                    },
                  },
                }}
              />
            </div>
            
            {/* Legend */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px' }}>
                {reportData.layananDiberikan.map((layanan: any, idx: number) => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
                  const total = reportData.layananDiberikan.reduce((sum: number, lay: any) => sum + lay.count, 0);
                  const percentage = ((layanan.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        flexShrink: 0,
                        backgroundColor: colors[idx % colors.length],
                        marginRight: '10px',
                        marginTop: '2px',
                        borderRadius: '2px'
                      }}></div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: '14px', color: '#333', lineHeight: '1.4' }}>
                        <strong>{layanan.layanan_name || 'Belum terdata'}:</strong> {layanan.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bidang Tujuan Pie Chart */}
      {reportData.bidangTujuan && reportData.bidangTujuan.length > 0 && (
        <div style={{ pageBreakInside: 'avoid' }}>
          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
            Sering Dikunjungi
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
            {/* Pie Chart */}
            <div style={{ width: '250px', height: '250px', flexShrink: 0 }}>
              <Pie
                data={{
                  labels: reportData.bidangTujuan.map((bidang: any) => bidang.bidang_name || 'Tidak Diketahui'),
                  datasets: [
                    {
                      label: 'Bidang Tujuan',
                      data: reportData.bidangTujuan.map((bidang: any) => bidang.count),
                      backgroundColor: [
                        '#8B5CF6',
                        '#EC4899',
                        '#06B6D4',
                        '#F59E0B',
                        '#EF4444',
                        '#10B981',
                        '#3B82F6',
                        '#F97316',
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: false,
                    },
                  },
                }}
              />
            </div>
            
            {/* Legend */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px' }}>
                {reportData.bidangTujuan.map((bidang: any, idx: number) => {
                  const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#F97316'];
                  const total = reportData.bidangTujuan.reduce((sum: number, bid: any) => sum + bid.count, 0);
                  const percentage = ((bidang.count / total) * 100).toFixed(1);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        backgroundColor: colors[idx % colors.length],
                        marginRight: '10px',
                        borderRadius: '2px'
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#333' }}>
                        <strong>{bidang.bidang_name || 'Tidak Diketahui'}:</strong> {bidang.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Footer for Page 2 */}
        <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', fontSize: '10px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Informasi Sistem</h4>
          <p style={{ margin: '5px 0' }}>Laporan ini dihasilkan dari Sistem Buku Tamu Digital</p>
          <p style={{ margin: '5px 0' }}>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
          <p style={{ margin: '5px 0' }}>
            <strong>Filter Waktu: </strong> {periodLabel}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Filter Bidang: </strong> 
            {filteredByDepartment ? `Data khusus bidang ${departmentName}` : 'Semua data'}
          </p>
          <p style={{ margin: '5px 0' }}>Status: {reportData.recentActivities && reportData.recentActivities.length > 0 ? 'Data Lengkap' : 'Data Terbatas'}</p>
        </div>
      </div>
    </>
  );
};

export default PdfReport;