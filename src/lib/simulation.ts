import { useSimulationStore, useSettingsStore, useHistoryStore } from './store';

export class SimulationEngine {
  private isRunning = false;
  private currentOperationIndex = 0;
  private totalOperations = 0;
  private packageName = '';
  private startTime: Date | null = null;

  async start(packageName: string, operationCount: number): Promise<void> {
    this.isRunning = true;
    this.currentOperationIndex = 0;
    this.totalOperations = operationCount;
    this.packageName = packageName;
    this.startTime = new Date();

    const store = useSimulationStore.getState();
    const settings = useSettingsStore.getState();
    const history = useHistoryStore.getState();

    try {
      for (let i = 0; i < operationCount && this.isRunning; i++) {
        this.currentOperationIndex = i + 1;
        
        // Update progress
        store.updateProgress(i, operationCount);
        store.setCurrentOperation(`Operation ${this.currentOperationIndex}/${operationCount}`);
        
        await this.performPubGetOperation(packageName, this.currentOperationIndex);
        
        // Use settings-based delay between operations
        if (this.isRunning && i < operationCount - 1) {
          await this.delay(settings.defaultDelay || 500);
        }
      }
      
      // Final progress update
      if (this.isRunning) {
        store.updateProgress(operationCount, operationCount);
        store.setCurrentOperation('Completed');
        store.addLog({
          operation: 'COMPLETE',
          status: 'success',
          message: `Simulation completed successfully. ${store.successCount} successful, ${store.failureCount} failed operations.`
        });
        
        // Save to history
        this.saveToHistory('completed');
      }
      
    } catch (error) {
      store.addLog({
        operation: 'ERROR',
        status: 'error',
        message: `Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      // Save failed simulation to history
      this.saveToHistory('failed');
    } finally {
      this.isRunning = false;
      const finalStore = useSimulationStore.getState();
      finalStore.isRunning = false;
    }
  }

  stop(): void {
    this.isRunning = false;
    // Save cancelled simulation to history
    this.saveToHistory('cancelled');
  }

  private saveToHistory(status: 'completed' | 'failed' | 'cancelled'): void {
    if (!this.startTime) return;
    
    const store = useSimulationStore.getState();
    const history = useHistoryStore.getState();
    
    history.addEntry({
      packageName: this.packageName,
      operationCount: this.totalOperations,
      startedAt: this.startTime,
      completedAt: new Date(),
      status,
      successCount: store.successCount,
      failureCount: store.failureCount,
      logs: [...store.logs]
    });
  }

  private async performPubGetOperation(packageName: string, operationNumber: number): Promise<void> {
    const store = useSimulationStore.getState();
    
    try {
      // Step 1: Check dependencies
      store.addLog({
        operation: `PUB_GET_${operationNumber}`,
        status: 'running',
        message: `Checking dependencies for ${packageName}...`
      });
      
      const settings = useSettingsStore.getState();
      await this.delay(this.randomDelay(300, 800) * (settings.defaultDelay / 1000));
      
      // Step 2: Download package
      store.addLog({
        operation: `PUB_GET_${operationNumber}`,
        status: 'running',
        message: `Downloading ${packageName} package...`
      });
      
      await this.delay(this.randomDelay(1000, 2500) * (settings.defaultDelay / 1000));
      
      // Simulate occasional failures (10% chance)
      if (Math.random() < 0.1) {
        throw new Error(`Failed to download ${packageName}: Network timeout`);
      }
      
      // Step 3: Resolve dependencies
      store.addLog({
        operation: `PUB_GET_${operationNumber}`,
        status: 'running',
        message: `Resolving dependencies for ${packageName}...`
      });
      
      await this.delay(this.randomDelay(500, 1200) * (settings.defaultDelay / 1000));
      
      // Step 4: Success
      store.addLog({
        operation: `PUB_GET_${operationNumber}`,
        status: 'success',
        message: `✓ Successfully downloaded ${packageName}`
      });
      
      store.incrementSuccess();
      
      // Step 5: Clear cache (if enabled in settings)
      if (settings.autoClearCache) {
        await this.performCacheClearOperation(packageName, operationNumber);
      }
      
    } catch (error) {
      store.addLog({
        operation: `PUB_GET_${operationNumber}`,
        status: 'error',
        message: `✗ ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      store.incrementFailure();
    }
  }

  private async performCacheClearOperation(packageName: string, operationNumber: number): Promise<void> {
    const store = useSimulationStore.getState();
    
    try {
      store.addLog({
        operation: `CACHE_CLEAR_${operationNumber}`,
        status: 'running',
        message: `Clearing cache for ${packageName}...`
      });
      
      const settings = useSettingsStore.getState();
      await this.delay(this.randomDelay(200, 600) * (settings.defaultDelay / 1000));
      
      // Simulate occasional cache clear failures (5% chance)
      if (Math.random() < 0.05) {
        throw new Error(`Failed to clear cache for ${packageName}: Permission denied`);
      }
      
      store.addLog({
        operation: `CACHE_CLEAR_${operationNumber}`,
        status: 'success',
        message: `✓ Cache cleared for ${packageName}`
      });
      
    } catch (error) {
      store.addLog({
        operation: `CACHE_CLEAR_${operationNumber}`,
        status: 'error',
        message: `✗ Cache clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Mock Flutter CLI commands for demonstration
export class MockFlutterCLI {
  static async pubGet(packageName: string): Promise<{ success: boolean; output: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      return {
        success: false,
        output: `Error: Failed to download ${packageName}. Network error.`
      };
    }
    
    return {
      success: true,
      output: `Running "flutter pub get" in project...\nResolving dependencies...\n+ ${packageName} 1.0.0\nChanged 1 dependency!`
    };
  }
  
  static async pubCacheClean(): Promise<{ success: boolean; output: string }> {
    // Simulate cache clearing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) {
      return {
        success: false,
        output: 'Error: Failed to clear pub cache. Permission denied.'
      };
    }
    
    return {
      success: true,
      output: 'Pub cache cleared successfully.'
    };
  }
}

// Package information utility
export class PackageInfo {
  static readonly POPULAR_PACKAGES = [
    {
      name: 'http',
      description: 'A composable, multi-platform, Future-based API for HTTP requests.',
      version: '^1.1.0',
      category: 'Network'
    },
    {
      name: 'dio',
      description: 'A powerful HTTP client for Dart/Flutter with interceptors, request/response transformation.',
      version: '^5.3.0',
      category: 'Network'
    },
    {
      name: 'shared_preferences',
      description: 'Flutter plugin for reading and writing simple key-value pairs.',
      version: '^2.2.0',
      category: 'Storage'
    },
    {
      name: 'provider',
      description: 'A wrapper around InheritedWidget to make them easier to use and more reusable.',
      version: '^6.0.0',
      category: 'State Management'
    },
    {
      name: 'flutter_bloc',
      description: 'Flutter Widgets that make it easy to integrate blocs and cubits into Flutter.',
      version: '^8.1.0',
      category: 'State Management'
    },
    {
      name: 'get',
      description: 'Open screens/snackbars/dialogs/bottomSheets without context, manage states and inject dependencies.',
      version: '^4.6.0',
      category: 'State Management'
    },
    {
      name: 'cached_network_image',
      description: 'Flutter library to load and cache network images.',
      version: '^3.3.0',
      category: 'UI'
    },
    {
      name: 'sqflite',
      description: 'Flutter plugin for SQLite, a self-contained, high-reliability, embedded, SQL database engine.',
      version: '^2.3.0',
      category: 'Database'
    },
    {
      name: 'path_provider',
      description: 'Flutter plugin for getting commonly used locations on host platform file systems.',
      version: '^2.1.0',
      category: 'File System'
    },
    {
      name: 'image_picker',
      description: 'Flutter plugin for selecting images from the Android and iOS image library.',
      version: '^1.0.0',
      category: 'Media'
    }
  ];
  
  static getPackageInfo(packageName: string) {
    return this.POPULAR_PACKAGES.find(pkg => pkg.name === packageName) || {
      name: packageName,
      description: 'Custom Flutter package',
      version: 'latest',
      category: 'Unknown'
    };
  }
  
  static getAllPackages() {
    return this.POPULAR_PACKAGES;
  }
  
  static getPackagesByCategory(category: string) {
    return this.POPULAR_PACKAGES.filter(pkg => pkg.category === category);
  }
}