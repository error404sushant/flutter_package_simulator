import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, Cog6ToothIcon as Cog6ToothIconSolid, ClockIcon as ClockIconSolid } from '@heroicons/react/24/solid';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
    },
    {
      path: '/history',
      label: 'History',
      icon: ClockIcon,
      iconSolid: ClockIconSolid,
    },
  ];

  return (
    <nav className="card-material elevation-3" style={{backgroundColor: 'var(--flutter-surface)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="ml-3 text-title" style={{color: 'var(--flutter-blue)'}}>
                Flutter Package Simulator
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = isActive ? item.iconSolid : item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-body'
                      : 'text-caption hover:text-body hover:bg-gray-50'
                  }`}
                  style={{
                    borderBottom: isActive ? '2px solid var(--flutter-blue)' : 'none',
                    color: isActive ? 'var(--flutter-blue)' : undefined
                  }}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;