import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, StopIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { ClockIcon, CheckCircleIcon, XCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useSimulationStore } from '../lib/store';
import { SimulationEngine } from '../lib/simulation';

interface OperationLog {
  id: string;
  timestamp: string;
  operation: string;
  status: 'success' | 'error' | 'running';
  message: string;
}

const Dashboard: React.FC = () => {
  const {
    isRunning,
    currentOperation,
    totalOperations,
    successCount,
    failureCount,
    progress,
    logs,
    packageName,
    setPackageName,
    startSimulation,
    stopSimulation
  } = useSimulationStore();

  const [operationCount, setOperationCount] = useState<number>(5);
  const [selectedPackage, setSelectedPackage] = useState<string>('http');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  const [operationsPerSecond, setOperationsPerSecond] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const popularPackages = [
    'http',
    'dio',
    'shared_preferences',
    'provider',
    'flutter_bloc',
    'get',
    'cached_network_image',
    'sqflite',
    'path_provider',
    'image_picker',
    'date_change_checker'
  ];

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Timer and operations per second calculation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        // Calculate operations per second
        const totalSeconds = diff / 1000;
        const completedOps = successCount + failureCount;
        const opsPerSec = totalSeconds > 0 ? completedOps / totalSeconds : 0;
        setOperationsPerSecond(Number(opsPerSec.toFixed(2)));
      }, 1000);
    } else {
      setOperationsPerSecond(0);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, successCount, failureCount]);

  const handleStart = async () => {
    setStartTime(new Date());
    setElapsedTime('00:00');
    setPackageName(selectedPackage);
    await startSimulation(selectedPackage, operationCount);
  };

  const handleStop = () => {
    stopSimulation();
    setStartTime(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'running': return <ClockIcon className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-headline text-4xl mb-2" style={{color: 'var(--flutter-blue)'}}>
            Flutter Package Simulator
          </h1>
          <p className="text-body text-caption">
            Simulate Flutter package download operations with realistic delays and failures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="card-material elevation-2 p-6 mb-6">
              <h2 className="text-title mb-4" style={{color: 'var(--flutter-blue)'}}>
                <Cog6ToothIcon className="w-5 h-5 mr-2" style={{color: 'var(--flutter-blue)'}} />
                Simulation Controls
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-caption font-medium mb-2">
                    Number of Operations
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={operationCount}
                    onChange={(e) => setOperationCount(parseInt(e.target.value))}
                    disabled={isRunning}
                    className="input-material w-full"
                  />
                </div>

                <div>
                  <label className="block text-caption font-medium mb-2">
                    Package to Simulate
                  </label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    disabled={isRunning}
                    className="input-material w-full"
                  >
                    {popularPackages.map((pkg) => (
                      <option key={pkg} value={pkg}>
                        {pkg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleStart}
                    disabled={isRunning}
                    className="btn-material btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ripple elevation-1"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Start Simulation</span>
                  </button>
                  <button
                    onClick={handleStop}
                    disabled={!isRunning}
                    className="btn-material w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ripple elevation-1"
                    style={{backgroundColor: 'var(--flutter-error)', color: 'white'}}
                  >
                    <StopIcon className="w-5 h-5" />
                    <span>Stop Simulation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="card-material elevation-2 p-6">
              <h3 className="text-title mb-4" style={{color: 'var(--flutter-blue)'}}>
                Progress Tracker
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-material">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-caption">Current Operation:</span>
                    <p className="text-body font-medium truncate" title={currentOperation || 'Idle'}>
                      {currentOperation || 'Idle'}
                    </p>
                  </div>
                  <div>
                    <span className="text-caption">Elapsed Time:</span>
                    <p className="text-body font-medium">{elapsedTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-caption">Status:</span>
                    <p className="text-body font-medium flex items-center" style={{color: isRunning ? 'var(--flutter-blue)' : 'var(--flutter-text-primary)'}}>
                      {isRunning && <div className="w-2 h-2 rounded-full animate-pulse mr-2" style={{backgroundColor: 'var(--flutter-blue)'}}></div>}
                      {isRunning ? 'Running' : 'Idle'}
                    </p>
                  </div>
                  <div>
                    <span className="text-caption">Ops/sec:</span>
                    <p className="text-body font-medium">{operationsPerSecond}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Display & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card-material elevation-1 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{backgroundColor: 'var(--flutter-blue-50)'}}>
                    <ClockIcon className="w-6 h-6" style={{color: 'var(--flutter-blue)'}} />
                  </div>
                  <div className="ml-4">
                    <p className="text-caption font-medium">Total Operations</p>
                    <p className="text-2xl font-bold text-body">{totalOperations}</p>
                  </div>
                </div>
              </div>

              <div className="card-material elevation-1 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#E8F5E8'}}>
                    <CheckCircleIcon className="w-6 h-6" style={{color: 'var(--flutter-success)'}} />
                  </div>
                  <div className="ml-4">
                    <p className="text-caption font-medium">Successful</p>
                    <p className="text-2xl font-bold text-body">{successCount}</p>
                  </div>
                </div>
              </div>

              <div className="card-material elevation-1 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#FFEBEE'}}>
                    <XCircleIcon className="w-6 h-6" style={{color: 'var(--flutter-error)'}} />
                  </div>
                  <div className="ml-4">
                    <p className="text-caption font-medium">Failed</p>
                    <p className="text-2xl font-bold text-body">{failureCount}</p>
                  </div>
                </div>
              </div>

              <div className="card-material elevation-1 p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{backgroundColor: '#FFF3E0'}}>
                    <BoltIcon className="w-6 h-6" style={{color: 'var(--flutter-warning)'}} />
                  </div>
                  <div className="ml-4">
                    <p className="text-caption font-medium">Ops/Second</p>
                    <p className="text-2xl font-bold text-body">{operationsPerSecond}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operation Logs */}
            <div className="card-material elevation-2">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-title" style={{color: 'var(--flutter-blue)'}}>
                  Operation Logs
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-gray-400">No operations yet. Click 'Start Simulation' to begin.</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start space-x-2 hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                          <span className="text-gray-400 text-xs mt-0.5 min-w-[60px]">
                            {log.timestamp}
                          </span>
                          <div className="flex items-center space-x-1 min-w-[120px]">
                            {getStatusIcon(log.status)}
                            <span className={`${getStatusColor(log.status)} text-xs`}>
                              {log.operation}
                            </span>
                          </div>
                          <span className="text-gray-300 flex-1 text-xs">
                            {log.message}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;