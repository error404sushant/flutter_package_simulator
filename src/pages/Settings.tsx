import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../lib/store';
import { PackageInfo } from '../lib/packageInfo';

interface CustomPackage {
  name: string;
  version: string;
  isFavorite: boolean;
}

const Settings: React.FC = () => {
  const {
    preferredPackage,
    setPreferredPackage,
    defaultDelay,
    setDefaultDelay,
    timeout,
    setTimeout,
    retryCount,
    setRetryCount,
    autoClearCache,
    setAutoClearCache,
    cacheLocation,
    setCacheLocation,
    maxCacheSize,
    setMaxCacheSize
  } = useSettingsStore();

  const [customPackages, setCustomPackages] = useState<CustomPackage[]>([]);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageVersion, setNewPackageVersion] = useState('');

  const popularPackages = PackageInfo.getPopularPackages();
  const categories = PackageInfo.getCategories();

  const handleAddCustomPackage = () => {
    if (newPackageName.trim() && newPackageVersion.trim()) {
      const newPackage: CustomPackage = {
        name: newPackageName.trim(),
        version: newPackageVersion.trim(),
        isFavorite: false
      };
      setCustomPackages([...customPackages, newPackage]);
      setNewPackageName('');
      setNewPackageVersion('');
    }
  };

  const handleRemoveCustomPackage = (index: number) => {
    setCustomPackages(customPackages.filter((_, i) => i !== index));
  };

  const handleToggleFavorite = (index: number) => {
    setCustomPackages(customPackages.map((pkg, i) => 
      i === index ? { ...pkg, isFavorite: !pkg.isFavorite } : pkg
    ));
  };

  const handleSave = () => {
    // Settings are automatically saved via useEffect hooks
    // This could trigger a toast notification or other feedback
    console.log('Settings saved successfully');
  };

  return (
    <div className="min-h-screen py-8" style={{backgroundColor: 'var(--flutter-background)'}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-material elevation-2">
          <div className="px-6 py-4 border-b" style={{borderColor: 'var(--flutter-divider)'}}>
            <h1 className="text-headline flex items-center" style={{color: 'var(--flutter-on-surface)'}}>
              <Cog6ToothIcon className="w-8 h-8 mr-3 text-blue-600" />
              Settings
            </h1>
            <p className="mt-1 text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
              Configure your Flutter package simulation preferences
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Configuration */}
              <div className="card-material elevation-1 p-6">
                <h2 className="text-title mb-4 flex items-center" style={{color: 'var(--flutter-on-surface)'}}>
                  Package Configuration
                </h2>
            
                <div className="space-y-4">
                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Preferred Package
                    </label>
                    <input
                      type="text"
                      value={preferredPackage}
                      onChange={(e) => setPreferredPackage(e.target.value)}
                      placeholder="e.g., date_change_checker: ^2.0.2"
                      className="input-material w-full"
                    />
                    <p className="text-caption mt-1" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      Enter package name with version (e.g., package_name: ^1.0.0)
                    </p>
                  </div>

                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Popular Packages by Category
                    </label>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category} className="border rounded-md p-3" style={{borderColor: 'var(--flutter-divider)'}}>
                          <h4 className="font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>{category}</h4>
                          <div className="grid grid-cols-1 gap-1">
                            {PackageInfo.getPackagesByCategory(category).map(pkg => (
                              <div key={pkg.name} className="flex items-center justify-between text-sm">
                                <span style={{color: 'var(--flutter-on-surface)'}}>{pkg.name}</span>
                                <span style={{color: 'var(--flutter-on-surface-variant)'}}>{pkg.version}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Add Custom Package
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Package name"
                        value={newPackageName}
                        onChange={(e) => setNewPackageName(e.target.value)}
                        className="input-material flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Version"
                        value={newPackageVersion}
                        onChange={(e) => setNewPackageVersion(e.target.value)}
                        className="input-material w-24"
                      />
                      <button
                        onClick={handleAddCustomPackage}
                        className="btn-material btn-primary px-3 py-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {customPackages.length > 0 && (
                    <div>
                      <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                        Custom Packages
                      </label>
                      <div className="space-y-2">
                        {customPackages.map((pkg, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-md" style={{borderColor: 'var(--flutter-divider)'}}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={pkg.isFavorite}
                                onChange={() => handleToggleFavorite(index)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-body font-medium" style={{color: 'var(--flutter-on-surface)'}}>{pkg.name}</span>
                              <span className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>{pkg.version}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveCustomPackage(index)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulation Parameters */}
              <div className="card-material elevation-1 p-6">
                <h2 className="text-title mb-4" style={{color: 'var(--flutter-on-surface)'}}>
                  Simulation Parameters
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Default Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={defaultDelay}
                      onChange={(e) => setDefaultDelay(Number(e.target.value))}
                      min="100"
                      max="5000"
                      className="input-material w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Operation Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={timeout}
                      onChange={(e) => setTimeout(parseInt(e.target.value) || 30)}
                      className="input-material w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                      Retry Count on Failure
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={retryCount}
                      onChange={(e) => setRetryCount(parseInt(e.target.value) || 3)}
                      className="input-material w-full"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoClearCache"
                      checked={autoClearCache}
                      onChange={(e) => setAutoClearCache(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{accentColor: 'var(--flutter-blue)'}}
                    />
                    <label htmlFor="autoClearCache" className="ml-2 block text-body" style={{color: 'var(--flutter-on-surface)'}}>
                      Auto-clear cache before operations
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Cache Management */}
            <div className="card-material elevation-1 p-6 mt-6">
              <h2 className="text-title mb-4 flex items-center" style={{color: 'var(--flutter-on-surface)'}}>
                Cache Management
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                    Cache Location
                  </label>
                  <input
                    type="text"
                    value={cacheLocation}
                    onChange={(e) => setCacheLocation(e.target.value)}
                    className="input-material w-full"
                    placeholder="~/.pub-cache"
                  />
                </div>

                <div>
                  <label className="block text-body font-medium mb-2" style={{color: 'var(--flutter-on-surface)'}}>
                    Maximum Cache Size (MB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10240"
                    value={maxCacheSize}
                    onChange={(e) => setMaxCacheSize(parseInt(e.target.value) || 1024)}
                    className="input-material w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--flutter-surface-variant)'}}>
                    <h3 className="text-body font-medium mb-1" style={{color: 'var(--flutter-on-surface)'}}>
                      Cache Location
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      {cacheLocation}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--flutter-surface-variant)'}}>
                    <h3 className="text-body font-medium mb-1" style={{color: 'var(--flutter-on-surface)'}}>
                      Max Cache Size
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      {maxCacheSize} MB
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--flutter-surface-variant)'}}>
                    <h3 className="text-body font-medium mb-1" style={{color: 'var(--flutter-on-surface)'}}>
                      Current Size
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      ~{Math.floor(Math.random() * 500 + 100)} MB
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{borderColor: 'var(--flutter-divider)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-body font-medium" style={{color: 'var(--flutter-on-surface)'}}>
                      Cache Usage
                    </span>
                    <span className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      ~{Math.floor(Math.random() * 500 + 100)} MB
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{backgroundColor: 'var(--flutter-surface-variant)'}}>
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${Math.floor(Math.random() * 60 + 20)}%`,
                        backgroundColor: 'var(--flutter-blue)'
                      }}
                    />
                  </div>
                </div>

                <button className="btn-material btn-secondary w-full mt-4">
                  Clear All Cache
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="card-material elevation-1 p-6 mt-6">
              <h2 className="text-title mb-4 flex items-center" style={{color: 'var(--flutter-on-surface)'}}>
                Advanced Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body font-medium" style={{color: 'var(--flutter-on-surface)'}}>
                      Verbose Logging
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      Enable detailed operation logs
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="verboseLogging"
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{accentColor: 'var(--flutter-blue)'}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body font-medium" style={{color: 'var(--flutter-on-surface)'}}>
                      Simulate Network Issues
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      Add random network delays and failures
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="simulateNetworkIssues"
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{accentColor: 'var(--flutter-blue)'}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body font-medium" style={{color: 'var(--flutter-on-surface)'}}>
                      Save Operation History
                    </h3>
                    <p className="text-caption" style={{color: 'var(--flutter-on-surface-variant)'}}>
                      Keep logs of all simulation runs
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="saveHistory"
                    defaultChecked={true}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                    style={{accentColor: 'var(--flutter-blue)'}}
                  />
                </div>
              </div>

              <div className="pt-4 border-t" style={{borderColor: 'var(--flutter-divider)'}}>
                <button className="btn-material btn-secondary w-full">
                  Reset to Default Settings
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="btn-material btn-primary px-8"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;