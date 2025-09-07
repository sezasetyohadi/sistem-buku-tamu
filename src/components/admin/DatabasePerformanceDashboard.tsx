/**
 * Database Performance Dashboard Component
 * Shows real-time database metrics and performance statistics
 */

'use client';

import { useState, useEffect } from 'react';

// Simple Card Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

interface PerformanceMetrics {
  database: {
    totalQueries: number;
    slowQueries: number;
    cacheSize: number;
    poolConnections: number;
    timestamp: string;
  };
  pool: {
    status: string;
    connectionLimit: number;
    timestamp: string;
  };
  server: {
    memory: {
      used: number;
      total: number;
      external: number;
    };
    uptime: number;
    nodeVersion: string;
    platform: string;
  };
}

export default function DatabasePerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/performance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error loading performance metrics</div>
            <div className="text-sm text-gray-600 mb-4">{error}</div>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const slowQueryPercent = metrics.database.totalQueries > 0 
    ? (metrics.database.slowQueries / metrics.database.totalQueries) * 100 
    : 0;

  const memoryUsagePercent = (metrics.server.memory.used / metrics.server.memory.total) * 100;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Performance</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Database Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.pool.status)}`}>
              {metrics.pool.status.toUpperCase()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Pool: {metrics.pool.connectionLimit} connections
            </p>
          </CardContent>
        </Card>

        {/* Query Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.totalQueries}</div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.database.slowQueries} slow ({slowQueryPercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        {/* Cache Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Query Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.cacheSize}</div>
            <p className="text-xs text-gray-600 mt-1">cached entries</p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.server.memory.used}MB</div>
            <p className="text-xs text-gray-600 mt-1">
              {memoryUsagePercent.toFixed(1)}% of {metrics.server.memory.total}MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Server Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Server Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="text-sm font-medium">{formatUptime(metrics.server.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Node.js:</span>
              <span className="text-sm font-medium">{metrics.server.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Platform:</span>
              <span className="text-sm font-medium">{metrics.server.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">External Memory:</span>
              <span className="text-sm font-medium">{metrics.server.memory.external}MB</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${metrics.pool.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Database Connection: {metrics.pool.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${slowQueryPercent < 5 ? 'bg-green-500' : slowQueryPercent < 15 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                Query Performance: {slowQueryPercent < 5 ? 'Excellent' : slowQueryPercent < 15 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${memoryUsagePercent < 70 ? 'bg-green-500' : memoryUsagePercent < 85 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                Memory Usage: {memoryUsagePercent < 70 ? 'Normal' : memoryUsagePercent < 85 ? 'High' : 'Critical'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${metrics.database.cacheSize > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">
                Query Cache: {metrics.database.cacheSize > 0 ? 'Active' : 'Empty'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {new Date(metrics.database.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
