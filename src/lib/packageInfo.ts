export interface Package {
  name: string;
  version: string;
  description: string;
  category: string;
}

export class PackageInfo {
  private static packages: Package[] = [
    // UI & Widgets
    { name: 'flutter_bloc', version: '^8.1.3', description: 'State management library', category: 'State Management' },
    { name: 'provider', version: '^6.1.1', description: 'Dependency injection and state management', category: 'State Management' },
    { name: 'riverpod', version: '^2.4.9', description: 'Simple state management', category: 'State Management' },
    { name: 'get', version: '^4.6.6', description: 'High-performance state management', category: 'State Management' },
    
    // HTTP & Networking
    { name: 'http', version: '^1.1.2', description: 'HTTP client for Dart', category: 'Networking' },
    { name: 'dio', version: '^5.4.0', description: 'Powerful HTTP client', category: 'Networking' },
    { name: 'chopper', version: '^7.0.8', description: 'HTTP client generator', category: 'Networking' },
    
    // Database & Storage
    { name: 'sqflite', version: '^2.3.0', description: 'SQLite plugin for Flutter', category: 'Database' },
    { name: 'hive', version: '^2.2.3', description: 'Lightweight NoSQL database', category: 'Database' },
    { name: 'shared_preferences', version: '^2.2.2', description: 'Persistent storage for simple data', category: 'Database' },
    { name: 'path_provider', version: '^2.1.1', description: 'Find commonly used locations', category: 'Database' },
    
    // UI Components
    { name: 'flutter_svg', version: '^2.0.9', description: 'SVG rendering support', category: 'UI Components' },
    { name: 'cached_network_image', version: '^3.3.0', description: 'Image caching', category: 'UI Components' },
    { name: 'flutter_staggered_grid_view', version: '^0.7.0', description: 'Staggered grid layouts', category: 'UI Components' },
    { name: 'flutter_slidable', version: '^3.0.1', description: 'Slidable list items', category: 'UI Components' },
    
    // Navigation
    { name: 'go_router', version: '^12.1.3', description: 'Declarative routing', category: 'Navigation' },
    { name: 'auto_route', version: '^7.9.2', description: 'Code generation based router', category: 'Navigation' },
    
    // Utils
    { name: 'intl', version: '^0.19.0', description: 'Internationalization and localization', category: 'Utils' },
    { name: 'url_launcher', version: '^6.2.2', description: 'Launch URLs in mobile platform', category: 'Utils' },
    { name: 'package_info_plus', version: '^5.0.1', description: 'Get package information', category: 'Utils' },
    { name: 'device_info_plus', version: '^9.1.1', description: 'Get device information', category: 'Utils' },
    { name: 'date_change_checker', version: '^2.0.2', description: 'Date change detection utility', category: 'Utils' },
    
    // Animation
    { name: 'lottie', version: '^2.7.0', description: 'Lottie animations', category: 'Animation' },
    { name: 'flutter_animate', version: '^4.3.0', description: 'Animation library', category: 'Animation' },
    
    // Testing
    { name: 'mockito', version: '^5.4.4', description: 'Mock library for testing', category: 'Testing' },
    { name: 'bloc_test', version: '^9.1.5', description: 'Testing utilities for bloc', category: 'Testing' }
  ];

  static getAllPackages(): Package[] {
    return this.packages;
  }

  static getPackagesByCategory(category: string): Package[] {
    return this.packages.filter(pkg => pkg.category === category);
  }

  static getCategories(): string[] {
    const categories = new Set(this.packages.map(pkg => pkg.category));
    return Array.from(categories).sort();
  }

  static getPackageByName(name: string): Package | undefined {
    return this.packages.find(pkg => pkg.name === name);
  }

  static getPopularPackages(): Package[] {
    // Return most commonly used packages
    const popularNames = [
      'flutter_bloc', 'provider', 'http', 'dio', 'sqflite', 
      'shared_preferences', 'cached_network_image', 'go_router', 
      'intl', 'url_launcher'
    ];
    
    return popularNames
      .map(name => this.getPackageByName(name))
      .filter((pkg): pkg is Package => pkg !== undefined);
  }
}