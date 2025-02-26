import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  // ... other imports
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Commit', href: '/commit', icon: DocumentTextIcon },
    { name: 'Explore', href: '/explore', icon: ChartBarIcon },
    { name: 'Entities', href: '/entities', icon: UserGroupIcon },
  ];
  
  // Explore submenu
  const exploreSubmenu = [
    { name: 'Documents', href: '/explore/documents' },
    { name: 'Topics', href: '/explore/topics' },
    { name: 'Entities', href: '/explore/entities' },
    { name: 'Connectome', href: '/explore/connectome' },
  ];
  
  // Entities submenu
  const entitiesSubmenu = [
    { name: 'Companies', href: '/entities/companies' },
    { name: 'Organizations', href: '/entities/organizations' },
    { name: 'People', href: '/entities/people' },
    { name: 'Add Entity', href: '/entities/add' },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const isExploreActive = location.pathname.startsWith('/explore');
  const isEntitiesActive = location.pathname.startsWith('/entities');

  return (
    <nav className="flex flex-col h-full bg-gray-100">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">CORTEX</h1>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <ul className="p-2">
          {navigation.map((item) => (
            <li key={item.name} className="mb-1">
              <Link
                to={item.href}
                className={`flex items-center p-2 rounded-md ${
                  isActive(item.href) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                <span>{item.name}</span>
              </Link>
              
              {/* Explore submenu */}
              {item.name === 'Explore' && isExploreActive && (
                <ul className="ml-6 mt-1 space-y-1">
                  {exploreSubmenu.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.href}
                        className={`block p-2 rounded-md ${
                          location.pathname === subItem.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Entities submenu */}
              {item.name === 'Entities' && isEntitiesActive && (
                <ul className="ml-6 mt-1 space-y-1">
                  {entitiesSubmenu.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.href}
                        className={`block p-2 rounded-md ${
                          location.pathname === subItem.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
} 