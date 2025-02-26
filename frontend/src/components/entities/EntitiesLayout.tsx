import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';

export default function EntitiesLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || '';
  
  const tabs = [
    { name: 'Companies', href: 'companies' },
    { name: 'Organizations', href: 'organizations' },
    { name: 'People', href: 'people' },
    { name: 'Add Entity', href: 'add' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabs.findIndex(tab => tab.href === currentPath)}
          aria-label="entity tabs"
        >
          {tabs.map((tab) => (
            <Tab 
              key={tab.href}
              label={tab.name} 
              component={Link} 
              to={`/entities/${tab.href}`} 
            />
          ))}
        </Tabs>
      </Box>
      <div className="flex-grow overflow-auto">
        <Outlet />
      </div>
    </div>
  );
} 