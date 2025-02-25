import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

type DetailPanelProps = {
  item: {
    title: string
    date_added: string
    file_type: string
    status: string
    summary?: string
  }
}

export const DetailPanel = ({ item }: DetailPanelProps) => {
  return (
    <Box
      bg="background.secondary"
      p={4}
      borderRadius="md"
      h="full"
      overflowY="auto"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="text.primary" fontFamily="display">
          {item.title}
        </Heading>
        
        <Box>
          <Text color="text.secondary" fontSize="sm">Date Added</Text>
          <Text color="text.primary">{item.date_added}</Text>
        </Box>

        <Box>
          <Text color="text.secondary" fontSize="sm">Type</Text>
          <Text color="text.primary">{item.file_type}</Text>
        </Box>

        <Box>
          <Text color="text.secondary" fontSize="sm">Status</Text>
          <Text
            color={item.status === 'processed' ? 'green.400' : 'yellow.400'}
          >
            {item.status}
          </Text>
        </Box>

        {item.summary && (
          <>
            <Divider borderColor="whiteAlpha.200" />
            <Box>
              <Text color="text.secondary" fontSize="sm" mb={2}>Summary</Text>
              <Box color="text.primary">
                <ReactMarkdown>{item.summary}</ReactMarkdown>
              </Box>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  )
} 