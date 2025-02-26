import React, { useState } from 'react'
import { 
  Box, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement 
} from '@chakra-ui/react'

// Reusing the same SearchIconSvg from ExploreTable
const SearchIconSvg = () => (
  <Box color="gray.400" ml={2}>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.47653 10.8907C8.49572 11.7199 7.23206 12.25 5.84375 12.25C2.61621 12.25 0 9.63379 0 6.40625C0 3.17871 2.61621 0.5625 5.84375 0.5625C9.07129 0.5625 11.6875 3.17871 11.6875 6.40625C11.6875 7.79456 11.1574 9.05823 10.3282 10.039L13.7803 13.4911C14.0732 13.784 14.0732 14.2535 13.7803 14.5464C13.4874 14.8394 13.0179 14.8394 12.725 14.5464L9.47653 11.2979V10.8907ZM10.5 6.40625C10.5 8.98214 8.41964 11.0625 5.84375 11.0625C3.26786 11.0625 1.1875 8.98214 1.1875 6.40625C1.1875 3.83036 3.26786 1.75 5.84375 1.75C8.41964 1.75 10.5 3.83036 10.5 6.40625Z" fill="currentColor"/>
    </svg>
  </Box>
)

export const ExploreGraph = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Panel styling to match ExploreTable exactly
  const panelStyle = {
    bg: "#F0F0F0",  // Exact same light gray background as ExploreTable
    borderRadius: "4px",
    border: "1px solid",
    borderColor: "rgba(100, 100, 100, 0.2)",
    p: 5,
    height: "calc(100vh - 120px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  };
  
  return (
    <Box p={4} width="100%">
      {/* Search Bar exactly like ExploreTable */}
      <Box mb={4} width="100%">
        <InputGroup width="100%">
          <InputLeftElement pointerEvents="none">
            <SearchIconSvg />
          </InputLeftElement>
          <Input 
            placeholder="Search by tag name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="#FFFFFF"
            border="1px solid rgba(100, 100, 100, 0.2)"
            _focus={{
              boxShadow: "0 0 0 1px rgba(100, 100, 100, 0.4)",
              borderColor: "rgba(100, 100, 100, 0.4)"
            }}
            width="100%"
          />
        </InputGroup>
      </Box>
      
      {/* Main panel with graph - EXACT MATCH with ExploreTable */}
      <Box {...panelStyle} width="100%">
        <Text color="#404040" mb={4} fontFamily="heading" fontSize="md" fontWeight="bold">
          TAG NETWORK
        </Text>
        
        {/* Graph visualizations */}
        <Box 
          flex="1"
          overflowY="auto"
          overflowX="hidden"
          maxWidth="100%"
          position="relative"
        >
          <MockGraph />
        </Box>
      </Box>
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