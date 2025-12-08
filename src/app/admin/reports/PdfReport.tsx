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
    topVisitors: [],
    recentActivities: []
  };

  // Handle the actual API data structure - use recentActivities if topVisitors is empty
  let visitorsToShow = reportData.topVisitors || [];
  if (!visitorsToShow || visitorsToShow.length === 0) {
    // Convert recentActivities to visitor-like data
    const activityMap = new Map();
    if (reportData.recentActivities && reportData.recentActivities.length > 0) {
      reportData.recentActivities.forEach((activity: any) => {
        const key = `${activity.nama}-${activity.asal_instansi}`;
        if (activityMap.has(key)) {
          activityMap.get(key).visit_count++;
        } else {
          activityMap.set(key, {
            nama: activity.nama,
            asal_instansi: activity.asal_instansi,
            visit_count: 1
          });
        }
      });
      visitorsToShow = Array.from(activityMap.values()).slice(0, 5);
    }
  }

  // Ensure we have fallback data if everything is empty
  if (visitorsToShow.length === 0) {
    visitorsToShow = [
      { nama: 'Belum ada data', asal_instansi: 'Belum ada data', visit_count: 0 }
    ];
  }

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
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      fontSize: '12px', 
      color: '#333', 
      padding: '30px', 
      background: '#fff',
      minWidth: '794px',
      width: '794px',
      height: 'auto',
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
      <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
        Statistik Kunjungan
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Total Kunjungan</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Rata-rata Harian</th>
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

      {/* Visitor Trends Chart */}
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
                  pointBorderWidth: 1, // Thinner point border
                  pointRadius: 2, // Smaller points
                  pointHoverRadius: 3, // Smaller hover
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
                  radius: 2, // Smaller points
                  hoverRadius: 2,
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

      {/* Daily Visit Details */}
      {reportData.weeklyTrends && reportData.weeklyTrends.length > 0 && (
        <div style={{ marginTop: '10px', marginBottom: '20px', padding: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333', fontWeight: 'bold' }}>Detail Kunjungan per Hari:</h4>
          <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
            {reportData.weeklyTrends.map((item: any, idx: number) => {
              const date = new Date(item.date);
              const formattedDate = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
              return (
                <div key={idx} style={{ marginBottom: '3px' }}>
                  <strong>{formattedDate}:</strong> {item.visits} kunjungan
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Service Categories Pie Chart */}
      {reportData.serviceCategories && reportData.serviceCategories.length > 0 && (
        <>
          <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
            Kategori Layanan Populer
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
        </>
      )}

      {/* Top Visitors Table */}
      <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
        Tamu Paling Aktif
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Nama</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Instansi</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Jumlah Kunjungan</th>
          </tr>
        </thead>
        <tbody>
          {visitorsToShow.map((visitor: any, idx: number) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{visitor.nama}</td>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{visitor.asal_instansi}</td>
              <td style={{ border: '1px solid #999', padding: '8px', textAlign: 'center', fontSize: '11px' }}>{visitor.visit_count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Recent Activities Table */}
      <h3 style={{ marginTop: '20px', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
        Aktivitas Terbaru
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Nama</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Instansi</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Keperluan</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Tanggapan</th>
            <th style={{ border: '1px solid #999', padding: '8px', background: '#f5f5f5', fontSize: '11px' }}>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {activitiesToShow.map((activity: any, idx: number) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{activity.nama}</td>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{activity.asal_instansi}</td>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{activity.keperluan}</td>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>{activity.tanggapan}</td>
              <td style={{ border: '1px solid #999', padding: '8px', fontSize: '11px' }}>
                {new Date(activity.waktu_dibuat).toLocaleDateString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
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
  );
};

export default PdfReport;