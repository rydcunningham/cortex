import React, { useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  Text,
} from '@chakra-ui/react'
import { DetailPanel } from './DetailPanel'

type ProcessedFile = {
  id: string
  title: string
  date_added: string
  file_type: string
  status: string
  summary?: string
}

// Temporary mock data - replace with actual data fetching
const mockData: ProcessedFile[] = [
  {
    id: '1',
    title: 'Research Paper 1',
    date_added: '2024-03-20',
    file_type: 'PDF',
    status: 'processed',
    summary: 'This is a summary of research paper 1...'
  },
  // Add more mock items...
]

export const TableView = () => {
  const [selectedItem, setSelectedItem] = useState<ProcessedFile | null>(null)

  return (
    <Grid templateColumns="1fr auto" gap={6}>
      <GridItem>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th color="text.secondary">Title</Th>
                <Th color="text.secondary">Date Added</Th>
                <Th color="text.secondary">Type</Th>
                <Th color="text.secondary">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockData.map((item) => (
                <Tr
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  cursor="pointer"
                  _hover={{ bg: 'background.secondary' }}
                  bg={selectedItem?.id === item.id ? 'background.secondary' : undefined}
                >
                  <Td>{item.title}</Td>
                  <Td>{item.date_added}</Td>
                  <Td>{item.file_type}</Td>
                  <Td>
                    <Text
                      color={item.status === 'processed' ? 'green.400' : 'yellow.400'}
                    >
                      {item.status}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </GridItem>

      <GridItem w="400px">
        {selectedItem ? (
          <DetailPanel item={selectedItem} />
        ) : (
          <Box
            h="full"
            bg="background.secondary"
            p={4}
            borderRadius="md"
            color="text.secondary"
          >
            Select an item to view details
          </Box>
        )}
      </GridItem>
    </Grid>
  )
} 