import React from 'react'
import { useParams } from 'react-router-dom'
import { 
  Box, 
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Heading,
} from '@chakra-ui/react'
import TagNetwork from './TagNetwork'

// Mock data - matches structure from the Overclock project
const mockData = [
  { id: 1, name: 'Research Paper 1', type: 'PDF', status: 'Processed', date: '2024-03-20', power: '1.2 kW', temp: '72°F' },
  { id: 2, name: 'Market Analysis Q1', type: 'PDF', status: 'Processed', date: '2024-03-15', power: '0.8 kW', temp: '68°F' },
  { id: 3, name: 'Competitive Landscape', type: 'PDF', status: 'Processing', date: '2024-03-10', power: '1.5 kW', temp: '74°F' },
  { id: 4, name: 'Investment Thesis', type: 'PDF', status: 'Processed', date: '2024-03-05', power: '0.7 kW', temp: '70°F' },
]

export const ExplorePage = () => {
  const { view = 'table' } = useParams()
  
  // Panel styling to match reference exactly
  const panelStyle = {
    bg: "cyber-dark",
    borderRadius: "4px",
    border: "1px",
    borderColor: "rgba(0, 229, 255, 0.2)",
  }
  
  return (
    <Box p={4}>
      {/* Title Display */}
      <Box 
        {...panelStyle}
        p={5}
        mb={6}
      >
        <Text color="cyber-text" textTransform="uppercase" fontSize="lg" fontFamily="heading">
          {view === 'table' && 'Document Table'}
          {view === 'graph' && 'Document Tag Network'}
          {view === 'connectome' && 'Document Connectome'}
        </Text>
      </Box>
      
      {view === 'table' && (
        <Box 
          {...panelStyle}
          overflow="hidden"
        >
          <Table variant="unstyled" size="sm">
            <Thead bg="#0A1013">
              <Tr>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>NAME</Th>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>TYPE</Th>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>STATUS</Th>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>DATE</Th>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>POWER</Th>
                <Th color="cyber-text" borderColor="rgba(0, 229, 255, 0.1)" fontFamily="mono" py={3}>TEMP</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockData.map(item => (
                <Tr key={item.id} _hover={{ bg: "#262D33" }}>
                  <Td borderColor="rgba(0, 229, 255, 0.05)" fontFamily="mono" py={3}>{item.name}</Td>
                  <Td borderColor="rgba(0, 229, 255, 0.05)" fontFamily="mono" py={3}>{item.type}</Td>
                  <Td 
                    borderColor="rgba(0, 229, 255, 0.05)" 
                    fontFamily="mono"
                    color={item.status === 'Processed' ? 'cyber-green' : 'cyber-blue'}
                    py={3}
                  >
                    {item.status}
                  </Td>
                  <Td borderColor="rgba(0, 229, 255, 0.05)" fontFamily="mono" py={3}>{item.date}</Td>
                  <Td borderColor="rgba(0, 229, 255, 0.05)" fontFamily="mono" color="cyber-blue" py={3}>{item.power}</Td>
                  <Td borderColor="rgba(0, 229, 255, 0.05)" fontFamily="mono" py={3}>{item.temp}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {view === 'graph' && (
        <Box 
          {...panelStyle}
          p={6}
          minHeight="700px"
        >
          <Text color="cyber-text" fontSize="md" mb={4}>
            This visualization shows relationships between tags in your document database.
            Select a tag to explore its connections, or adjust the strength threshold to see 
            different levels of tag relationships.
          </Text>
          <TagNetwork />
        </Box>
      )}
      
      {view === 'connectome' && (
        <Box 
          {...panelStyle}
          p={6}
        >
          <Text color="cyber-text" fontSize="md">
            Connectome view coming soon
          </Text>
        </Box>
      )}
    </Box>
  )
} 