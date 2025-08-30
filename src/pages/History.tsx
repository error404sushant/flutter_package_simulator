import React, { useState, useMemo } from 'react';
import { ClockIcon, ChartBarIcon, TrashIcon, FunnelIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useHistoryStore, useSimulationStore } from '../lib/store';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'success' | 'failed';
  package: string;
}

const History: React.FC = () => {
  const { entries, clearHistory } = useHistoryStore();
  const { logs } = useSimulationStore();
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    status: 'all',
    package: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }
      
      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'success' && log.status !== 'success') return false;
        if (filters.status === 'failed' && log.status !== 'error') return false;
      }
      
      // Package filter
      if (filters.package !== 'all' && log.packageName !== filters.package) {
        return false;
      }
      
      return true;
    });
  }, [logs, filters]);

  // Performance metrics
  const metrics = useMemo(() => {
    const totalOperations = filteredLogs.length;
    const successfulOperations = filteredLogs.filter(log => log.status === 'success').length;
    const failedOperations = filteredLogs.filter(log => log.status === 'error').length;
    const averageTime = filteredLogs.length > 0 
      ? filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / filteredLogs.length 
      : 0;
    
    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      successRate: totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0,
      averageTime: Math.round(averageTime * 100) / 100
    };
  }, [filteredLogs]);

  // Chart data for performance over time
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyStats = last7Days.map(date => {
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === date;
      });
      
      return {
        date,
        total: dayLogs.length,
        successful: dayLogs.filter(log => log.status === 'success').length,
        failed: dayLogs.filter(log => log.status === 'error').length,
        avgTime: dayLogs.length > 0 
          ? dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / dayLogs.length 
          : 0
      };
    });

    return {
      labels: dailyStats.map(stat => new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Successful Operations',
          data: dailyStats.map(stat => stat.successful),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Failed Operations',
          data: dailyStats.map(stat => stat.failed),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }, [logs]);

  // Average time chart data
  const timeChartData = useMemo(() => {
    const packageStats = logs.reduce((acc, log) => {
      if (!acc[log.packageName]) {
        acc[log.packageName] = { total: 0, count: 0 };
      }
      acc[log.packageName].total += log.duration || 0;
      acc[log.packageName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const packages = Object.keys(packageStats).slice(0, 5); // Top 5 packages
    const avgTimes = packages.map(pkg => 
      packageStats[pkg].count > 0 ? packageStats[pkg].total / packageStats[pkg].count : 0
    );

    return {
      labels: packages,
      datasets: [
        {
          label: 'Average Time (seconds)',
          data: avgTimes,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [logs]);

  const uniquePackages: string[] = Array.from(new Set(logs.map(log => log.packageName || log.operation).filter(Boolean)));

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };



  return (
    <div className="min-h-screen py-8" style={{backgroundColor: 'var(--flutter-background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-headline mb-2 flex items-center" style={{color: 'var(--flutter-on-surface)'}}>
            <ClockIcon className="w-8 h-8 mr-3" style={{color: 'var(--flutter-blue)'}} />
            Operation History
          </h1>
          <p className="text-body" style={{color: 'var(--flutter-on-surface-variant)'}}>
            View detailed logs and performance metrics of your simulation runs.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={clearHistory}
            className="btn-danger flex items-center"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Clear History
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card-material elevation-2 p-6 mb-6">
            <h2 className="text-title mb-4" style={{color: 'var(--flutter-on-surface)'}}>
              Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                  className="input-material w-full"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="input-material w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Successful</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                  Package
                </label>
                <select
                  value={filters.package}
                  onChange={(e) => setFilters({ ...filters, package: e.target.value })}
                  className="input-material w-full"
                >
                  <option value="all">All Packages</option>
                  {uniquePackages.map(pkg => (
                    <option key={pkg} value={pkg}>{pkg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card-material elevation-2 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: 'var(--flutter-primary-container)'}}>
                <ChartBarIcon className="w-6 h-6" style={{color: 'var(--flutter-on-primary-container)'}} />
              </div>
              <div className="ml-4">
                <p className="text-caption font-medium" style={{color: 'var(--flutter-on-surface-variant)'}}>Total Operations</p>
                <p className="text-headline font-bold" style={{color: 'var(--flutter-on-surface)'}}>{metrics.totalOperations}</p>
              </div>
            </div>
          </div>

          <div className="card-material elevation-2 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: '#E8F5E8'}}>
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-caption font-medium" style={{color: 'var(--flutter-on-surface-variant)'}}>Success Rate</p>
                <p className="text-headline font-bold" style={{color: 'var(--flutter-on-surface)'}}>{metrics.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="card-material elevation-2 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: '#FFEBEE'}}>
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-caption font-medium" style={{color: 'var(--flutter-on-surface-variant)'}}>Failed Operations</p>
                <p className="text-headline font-bold" style={{color: 'var(--flutter-on-surface)'}}>{metrics.failedOperations}</p>
              </div>
            </div>
          </div>

          <div className="card-material elevation-2 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: '#FFF8E1'}}>
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-caption font-medium" style={{color: 'var(--flutter-on-surface-variant)'}}>Avg. Time</p>
                <p className="text-headline font-bold" style={{color: 'var(--flutter-on-surface)'}}>{formatDuration(metrics.averageTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card-material elevation-2 p-6">
            <h3 className="text-title mb-4" style={{color: 'var(--flutter-on-surface)'}}>
              Operations Over Time
            </h3>
            <div className="h-64">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div className="card-material elevation-2 p-6">
            <h3 className="text-title mb-4" style={{color: 'var(--flutter-on-surface)'}}>
              Average Time by Package
            </h3>
            <div className="h-64">
              <Bar
                data={timeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Time (seconds)'
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Operation Logs */}
        <div className="card-material elevation-2">
          <div className="px-6 py-4" style={{borderBottom: '1px solid var(--flutter-outline-variant)'}}>
            <h3 className="text-title" style={{color: 'var(--flutter-on-surface)'}}>Recent Operations</h3>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{backgroundColor: 'var(--flutter-surface-variant)'}}>
              <tr>
                <th className="px-6 py-3 text-left text-caption font-medium uppercase tracking-wider" style={{color: 'var(--flutter-on-surface-variant)'}}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-caption font-medium uppercase tracking-wider" style={{color: 'var(--flutter-on-surface-variant)'}}>
                  Package
                </th>
                <th className="px-6 py-3 text-left text-caption font-medium uppercase tracking-wider" style={{color: 'var(--flutter-on-surface-variant)'}}>
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-caption font-medium uppercase tracking-wider" style={{color: 'var(--flutter-on-surface-variant)'}}>
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-caption font-medium uppercase tracking-wider" style={{color: 'var(--flutter-on-surface-variant)'}}>
                  Message
                </th>
              </tr>
            </thead>
            <tbody style={{backgroundColor: 'var(--flutter-surface)'}}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-body" style={{color: 'var(--flutter-on-surface-variant)'}}>
                    No operations found. Start a simulation to see history.
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 50).map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50" style={{borderBottom: '1px solid var(--flutter-outline-variant)'}}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {log.status === 'success' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : log.status === 'error' ? (
                          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          log.status === 'success' ? 'text-green-800' :
                          log.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {log.status === 'success' ? 'Success' :
                           log.status === 'error' ? 'Failed' : log.status === 'running' ? 'Running' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body" style={{color: 'var(--flutter-on-surface)'}}>
                      {log.packageName || log.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body" style={{color: 'var(--flutter-on-surface)'}}>
                      {log.duration ? formatDuration(log.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-body" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 text-body max-w-xs truncate" style={{color: 'var(--flutter-on-surface)'}}>
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;