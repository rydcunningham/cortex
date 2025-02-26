import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Panel } from '../common/Panel'
import { SearchBar } from '../common/SearchBar'

export const ExploreGraph = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Box p={4} width="100%">
      {/* Search Bar using the new component */}
      <SearchBar 
        placeholder="Search by tag name..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {/* Main panel with graph */}
      <Panel title="TAG NETWORK">
        <MockGraph />
      </Panel>
    </Box>
  )
}

// Basic mock graph component
const MockGraph = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 500">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="rgba(100, 100, 100, 0.5)" />
        </marker>
      </defs>
      
      {/* Background */}
      <rect width="800" height="500" fill="#F0F0F0" />
      
      {/* Connections */}
      <line x1="400" y1="250" x2="200" y2="150" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="400" y1="250" x2="250" y2="350" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="400" y1="250" x2="600" y2="150" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="400" y1="250" x2="550" y2="350" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      
      {/* Nodes */}
      <circle cx="400" cy="250" r="30" fill="rgba(80, 80, 80, 0.7)" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1" />
      <text x="400" y="250" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12px">neural-networks</text>
      
      <circle cx="200" cy="150" r="25" fill="rgba(120, 120, 120, 0.7)" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1" />
      <text x="200" y="150" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10px">spiking-nn</text>
      
      <circle cx="250" cy="350" r="25" fill="rgba(120, 120, 120, 0.7)" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1" />
      <text x="250" y="350" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10px">weightless-nn</text>
      
      <circle cx="600" cy="150" r="20" fill="rgba(160, 160, 160, 0.7)" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1" />
      <text x="600" y="150" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10px">edge-computing</text>
      
      <circle cx="550" cy="350" r="20" fill="rgba(160, 160, 160, 0.7)" stroke="rgba(100, 100, 100, 0.2)" strokeWidth="1" />
      <text x="550" y="350" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10px">neuromorphic</text>
    </svg>
  )
} 