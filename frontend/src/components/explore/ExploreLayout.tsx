import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';

export default function ExploreLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || '';
  
  // Map the URL paths to tab indices
  const getTabIndex = () => {
    if (currentPath === 'table' || currentPath === 'documents') return 0;
    if (currentPath === 'graph' || currentPath === 'topics') return 1;
    if (currentPath === 'entities') return 2;
    if (currentPath === 'connectome') return 3;
    return 0;
  };
  
  // Map tab indices to URL paths (use the original paths)
  const getTabPath = (index: number) => {
    switch (index) {
      case 0: return 'table';
      case 1: return 'graph';
      case 2: return 'entities';
      case 3: return 'connectome';
      default: return 'table';
    }
  };
  
  const tabs = [
    { name: 'Documents', href: 'table' }, // Link to table but display as Documents
    { name: 'Topics', href: 'graph' }, // Link to graph but display as Topics
    { name: 'Entities', href: 'entities' },
    { name: 'Connectome', href: 'connectome' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={getTabIndex()}
          aria-label="explore tabs"
          onChange={(_, newValue) => {
            // This is handled by the Link component
          }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab.href}
              label={tab.name} 
              component={Link} 
              to={`/explore/${tab.href}`} 
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