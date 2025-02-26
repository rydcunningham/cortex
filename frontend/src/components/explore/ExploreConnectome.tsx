import React, { useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { Panel } from '../common/Panel'
import { SearchBar } from '../common/SearchBar'

export const ExploreConnectome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <Box p={4} width="100%">
      <SearchBar 
        placeholder="Search connectome..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <Panel title="CONNECTOME">
        <Text color="#505050">
          Connectome visualization will be shown here.
        </Text>
      </Panel>
    </Box>
  )
} 