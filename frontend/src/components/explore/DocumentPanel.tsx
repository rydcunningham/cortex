import React from 'react'
import { Box, VStack, Heading, Text, Tag, Divider } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

interface DocumentPanelProps {
  document: {
    title: string
    authors: string[]
    summary: string
    analysis: string
    tags: string[]
    added_date: string
    drive_link: string
  }
}

export const DocumentPanel = ({ document }: DocumentPanelProps) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="md">{document.title}</Heading>
      
      <Box>
        <Text fontSize="sm" color="gray.600">Authors</Text>
        <Text>{document.authors.join(', ')}</Text>
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.600">Added</Text>
        <Text>{new Date(document.added_date).toLocaleDateString()}</Text>
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.600">Tags</Text>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {document.tags.map(tag => (
            <Tag key={tag} colorScheme="blue" size="sm">{tag}</Tag>
          ))}
        </Box>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="sm" color="gray.600">Summary</Text>
        <Box bg="gray.50" p={4} borderRadius="md">
          <ReactMarkdown>{document.summary}</ReactMarkdown>
        </Box>
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.600">Analysis</Text>
        <Box bg="gray.50" p={4} borderRadius="md">
          <ReactMarkdown>{document.analysis}</ReactMarkdown>
        </Box>
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.600">
          <a href={document.drive_link} target="_blank" rel="noopener noreferrer">
            View in Google Drive →
          </a>
        </Text>
      </Box>
    </VStack>
  )
} 