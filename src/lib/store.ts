import { create } from 'zustand';

interface SimulationLog {
  id: string;
  timestamp: string;
  operation: string;
  status: 'success' | 'error' | 'running' | 'pending';
  message: string;
  packageName?: string;
  duration?: number;
}

interface SimulationState {
  // Simulation status
  isRunning: boolean;
  currentOperation: string;
  totalOperations: number;
  completedOperations: number;
  successCount: number;
  failureCount: number;
  progress: number;
  
  // Configuration
  packageName: string;
  operationCount: number;
  
  // Logs
  logs: SimulationLog[];
  
  // Actions
  setPackageName: (name: string) => void;
  setOperationCount: (count: number) => void;
  startSimulation: (packageName: string, count: number) => Promise<void>;
  stopSimulation: () => void;
  addLog: (log: Omit<SimulationLog, 'id' | 'timestamp'>) => void;
  updateProgress: (completed: number, total: number) => void;
  incrementSuccess: () => void;
  incrementFailure: () => void;
  setCurrentOperation: (operation: string) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  isRunning: false,
  currentOperation: '',
  totalOperations: 0,
  completedOperations: 0,
  successCount: 0,
  failureCount: 0,
  progress: 0,
  packageName: '',
  operationCount: 5,
  logs: [],

  // Actions
  setPackageName: (name: string) => set({ packageName: name }),
  
  setOperationCount: (count: number) => set({ operationCount: count }),
  
  startSimulation: async (packageName: string, count: number) => {
    const { resetSimulation, addLog } = get();
    
    // Reset previous simulation
    resetSimulation();
    
    set({
      isRunning: true,
      packageName,
      totalOperations: count,
      operationCount: count
    });
    
    addLog({
      operation: 'INIT',
      status: 'success',
      message: `Starting simulation for package '${packageName}' with ${count} operations`
    });
    
    // Import and start the simulation engine
    const { SimulationEngine } = await import('./simulation');
    const engine = new SimulationEngine();
    await engine.start(packageName, count);
  },
  
  stopSimulation: () => {
    const { addLog } = get();
    
    set({ isRunning: false, currentOperation: 'Stopped' });
    
    addLog({
      operation: 'STOP',
      status: 'error',
      message: 'Simulation stopped by user'
    });
  },
  
  addLog: (log: Omit<SimulationLog, 'id' | 'timestamp'>) => {
    const newLog: SimulationLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString()
    };
    
    set((state) => ({
      logs: [...state.logs, newLog]
    }));
  },
  
  updateProgress: (completed: number, total: number) => {
    const progress = total > 0 ? (completed / total) * 100 : 0;
    set({
      completedOperations: completed,
      totalOperations: total,
      progress
    });
  },
  
  incrementSuccess: () => {
    set((state) => ({
      successCount: state.successCount + 1
    }));
  },
  
  incrementFailure: () => {
    set((state) => ({
      failureCount: state.failureCount + 1
    }));
  },
  
  setCurrentOperation: (operation: string) => {
    set({ currentOperation: operation });
  },
  
  resetSimulation: () => {
    set({
      currentOperation: '',
      totalOperations: 0,
      completedOperations: 0,
      successCount: 0,
      failureCount: 0,
      progress: 0,
      logs: []
    });
  }
}));

// Settings store for user preferences
interface SettingsState {
  defaultDelay: number;
  autoClearCache: boolean;
  preferredPackage: string;
  timeout: number;
  retryCount: number;
  cacheLocation: string;
  maxCacheSize: number;
  
  setDefaultDelay: (delay: number) => void;
  setAutoClearCache: (enabled: boolean) => void;
  setPreferredPackage: (packageName: string) => void;
  setTimeout: (timeout: number) => void;
  setRetryCount: (count: number) => void;
  setCacheLocation: (location: string) => void;
  setMaxCacheSize: (size: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultDelay: 1000,
  autoClearCache: true,
  preferredPackage: 'http',
  timeout: 30,
  retryCount: 3,
  cacheLocation: '~/.pub-cache',
  maxCacheSize: 1024,
  
  setDefaultDelay: (delay: number) => set({ defaultDelay: delay }),
  setAutoClearCache: (enabled: boolean) => set({ autoClearCache: enabled }),
  setPreferredPackage: (packageName: string) => set({ preferredPackage: packageName }),
  setTimeout: (timeout: number) => set({ timeout: timeout }),
  setRetryCount: (count: number) => set({ retryCount: count }),
  setCacheLocation: (location: string) => set({ cacheLocation: location }),
  setMaxCacheSize: (size: number) => set({ maxCacheSize: size })
}));

// History store for operation logs
interface HistoryEntry {
  id: string;
  packageName: string;
  operationCount: number;
  startedAt: Date;
  completedAt: Date | null;
  status: 'completed' | 'failed' | 'cancelled';
  successCount: number;
  failureCount: number;
  logs: SimulationLog[];
}

interface HistoryState {
  entries: HistoryEntry[];
  
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  getEntry: (id: string) => HistoryEntry | undefined;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  
  addEntry: (entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    set((state) => ({
      entries: [newEntry, ...state.entries].slice(0, 50) // Keep only last 50 entries
    }));
  },
  
  clearHistory: () => set({ entries: [] }),
  
  getEntry: (id: string) => {
    const { entries } = get();
    return entries.find(entry => entry.id === id);
  }
}));