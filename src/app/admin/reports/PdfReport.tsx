import React from "react";

interface PdfReportProps {
  data: any;
}

const PdfReport = ({ data }: PdfReportProps) => {
  if (!data) return null;
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#333", padding: 24, background: "#fff" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Laporan Buku Tamu</h2>
      <p>
        <strong>Tanggal Cetak:</strong>{" "}
        {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
      </p>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Statistik Kunjungan</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Total Kunjungan</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Rata-rata Harian</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Waktu Rata-rata</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Tingkat Kepuasan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #aaa", padding: 8, textAlign: "center" }}>
              {data.metrics?.totalVisits?.value ?? "-"}
            </td>
            <td style={{ border: "1px solid #aaa", padding: 8, textAlign: "center" }}>
              {data.metrics?.dailyAverage?.value ?? "-"}
            </td>
            <td style={{ border: "1px solid #aaa", padding: 8, textAlign: "center" }}>
              {data.metrics?.avgDuration?.value ?? "-"}
            </td>
            <td style={{ border: "1px solid #aaa", padding: 8, textAlign: "center" }}>
              {data.metrics?.satisfaction?.value ?? "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Tamu Paling Aktif</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Nama</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Instansi</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Jumlah Kunjungan</th>
          </tr>
        </thead>
        <tbody>
          {data.topVisitors && data.topVisitors.length > 0 ? (
            data.topVisitors.map((visitor: any, idx: number) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{visitor.nama}</td>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{visitor.asal_instansi}</td>
                <td style={{ border: "1px solid #aaa", padding: 8, textAlign: "center" }}>{visitor.visit_count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ border: "1px solid #aaa", padding: 8, textAlign: "center", fontStyle: "italic" }}>
                Tidak ada data tamu aktif
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Aktivitas Terbaru</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Nama</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Instansi</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Keperluan</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Tanggapan</th>
            <th style={{ border: "1px solid #aaa", padding: 8, background: "#f0f0f0" }}>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.recentActivities && data.recentActivities.length > 0 ? (
            data.recentActivities.map((activity: any, idx: number) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{activity.nama}</td>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{activity.asal_instansi}</td>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{activity.keperluan}</td>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>{activity.tanggapan}</td>
                <td style={{ border: "1px solid #aaa", padding: 8 }}>
                  {new Date(activity.waktu_dibuat).toLocaleString("id-ID")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ border: "1px solid #aaa", padding: 8, textAlign: "center", fontStyle: "italic" }}>
                Tidak ada aktivitas terbaru
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PdfReport;