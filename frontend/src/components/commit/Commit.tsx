import React, { useState } from 'react'
import { 
  Box, 
  Text,
  VStack,
  Button,
  Heading,
  Flex,
  useToast,
  Code,
  Spinner,
  HStack,
  Divider,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react'
import { callApi } from '../../utils/api'

// API endpoints
const API_ENDPOINTS = {
  processLatest: '/api/process-latest',
  processFolder: '/api/process-folder',
  generateTags: '/api/generate-tags',
  retitleLatest: '/api/retitle-latest',
  retitleFolder: '/api/retitle-folder',
  reclassifyDocuments: '/api/reclassify-documents'
}

type OperationType = 'processLatest' | 'processFolder' | 'generateTags' | 'retitleLatest' | 'retitleFolder' | 'reclassifyDocuments' | null;

export const Commit = () => {
  const toast = useToast();
  const [currentOperation, setCurrentOperation] = useState<OperationType>(null);
  const [logs, setLogs] = useState<Record<string, string[]>>({
    processLatest: [],
    processFolder: [],
    generateTags: [],
    retitleLatest: [],
    retitleFolder: [],
    reclassifyDocuments: []
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    processLatest: false,
    processFolder: false,
    generateTags: false,
    retitleLatest: false,
    retitleFolder: false,
    reclassifyDocuments: false
  });
  
  // Panel styling with grayscale theme
  const panelStyle = {
    bg: "#F0F0F0",
    borderRadius: "4px",
    border: "1px",
    borderColor: "rgba(100, 100, 100, 0.2)",
    p: 4,
  }
  
  // Function to simulate log streaming
  const simulateLogStreaming = (operation: OperationType, startMessage: string) => {
    if (!operation) return;
    
    // Add initial log
    setLogs(prev => ({
      ...prev,
      [operation]: [...prev[operation], startMessage]
    }));
    
    // Set loading state
    setIsLoading(prev => ({
      ...prev,
      [operation]: true
    }));
  }
  
  // Function to handle API responses
  const handleApiResponse = (operation: OperationType, data: any) => {
    if (!operation) return;
    
    // Add logs based on API response
    setLogs(prev => ({
      ...prev,
      [operation]: [
        ...prev[operation],
        `✅ Operation completed successfully`,
        `Response status: ${data.status}`,
        ...(data.message ? [`Message: ${data.message}`] : []),
        ...(data.processed_count ? [`Processed ${data.processed_count} files`] : []),
        ...(data.tagged_count ? [`Tagged ${data.tagged_count} documents`] : []),
        `\nFull response: ${JSON.stringify(data, null, 2)}`
      ]
    }));
    
    // Set loading state to false
    setIsLoading(prev => ({
      ...prev,
      [operation]: false
    }));
  }
  
  // Function to handle API errors
  const handleApiError = (operation: OperationType, error: any) => {
    if (!operation) return;
    
    // Add error log
    setLogs(prev => ({
      ...prev,
      [operation]: [
        ...prev[operation],
        `❌ Error: ${error.message || 'Unknown error'}`,
        error.stack ? `Stack: ${error.stack}` : ''
      ]
    }));
    
    // Set loading state to false
    setIsLoading(prev => ({
      ...prev,
      [operation]: false
    }));
    
    // Show toast
    toast({
      title: 'Error',
      description: error.message || 'An error occurred during the operation',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
  
  // Function to make API call
  const makeApiCall = async (operation: OperationType) => {
    if (!operation) return;
    
    try {
      setCurrentOperation(operation);
      
      // Clear previous logs
      setLogs(prev => ({
        ...prev,
        [operation]: []
      }));
      
      // Start log streaming
      simulateLogStreaming(operation, `🚀 Starting ${operation} operation...`);
      setLogs(prev => ({
        ...prev,
        [operation]: [...prev[operation], `Making request to ${API_ENDPOINTS[operation]}...`]
      }));
      
      // Make API call
      const data = await callApi(API_ENDPOINTS[operation]);
      handleApiResponse(operation, data);
      
    } catch (error) {
      handleApiError(operation, error);
    }
  }
  
  // Function to format operation name for display
  const formatOperationName = (operation: string) => {
    return operation
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  return (
    <Box p={6} bg="#FAFAFA">
      <Heading size="lg" mb={6}>Knowledge Processor</Heading>
      
      {/* Document Processing Operations */}
      <Box {...panelStyle} mb={6}>
        <Text fontWeight="bold" mb={4}>Document Processing</Text>
        <SimpleGrid columns={[1, 2]} spacing={4}>
          <Button 
            onClick={() => makeApiCall('processLatest')} 
            isLoading={isLoading.processLatest}
            colorScheme="blue"
            variant="outline"
            height="50px"
          >
            Process Latest Document
          </Button>
          
          <Button 
            onClick={() => makeApiCall('processFolder')} 
            isLoading={isLoading.processFolder}
            colorScheme="purple"
            variant="outline"
            height="50px"
          >
            Process Entire Folder
          </Button>
        </SimpleGrid>
      </Box>
      
      {/* Metadata Enhancement Operations */}
      <Box {...panelStyle} mb={6}>
        <Text fontWeight="bold" mb={4}>Metadata Enhancement</Text>
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          <Button 
            onClick={() => makeApiCall('generateTags')} 
            isLoading={isLoading.generateTags}
            colorScheme="teal"
            variant="outline"
            height="50px"
          >
            Generate Tags
          </Button>
          
          <Button 
            onClick={() => makeApiCall('retitleLatest')} 
            isLoading={isLoading.retitleLatest}
            colorScheme="orange"
            variant="outline"
            height="50px"
          >
            Retitle Latest Document
          </Button>
          
          <Button 
            onClick={() => makeApiCall('retitleFolder')} 
            isLoading={isLoading.retitleFolder}
            colorScheme="red"
            variant="outline"
            height="50px"
          >
            Retitle All Documents
          </Button>
          
          <Button 
            onClick={() => makeApiCall('reclassifyDocuments')} 
            isLoading={isLoading.reclassifyDocuments}
            colorScheme="cyan"
            variant="outline"
            height="50px"
          >
            Reclassify Documents
          </Button>
        </SimpleGrid>
      </Box>
      
      {/* Log Panel */}
      <Box {...panelStyle}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="bold">Operation Logs</Text>
          {currentOperation && (
            <Badge colorScheme={isLoading[currentOperation] ? 'orange' : 'green'}>
              {isLoading[currentOperation] ? 'Running' : 'Completed'}: {formatOperationName(currentOperation)}
            </Badge>
          )}
        </Flex>
        
        <Divider mb={4} />
        
        {currentOperation ? (
          <Box 
            bg="#FFFFFF" 
            p={4} 
            borderRadius="md" 
            height="400px" 
            overflowY="auto"
            fontFamily="monospace"
            fontSize="sm"
            position="relative"
          >
            {isLoading[currentOperation] && (
              <Flex 
                position="absolute" 
                top={2} 
                right={2} 
                bg="rgba(255,255,255,0.8)" 
                p={1} 
                borderRadius="md"
              >
                <Spinner size="sm" mr={2} />
                <Text fontSize="xs">Processing...</Text>
              </Flex>
            )}
            
            {logs[currentOperation].length > 0 ? (
              logs[currentOperation].map((log, index) => (
                <Text key={index} whiteSpace="pre-wrap" mb={1}>
                  {log.startsWith('{') ? (
                    <Code colorScheme="gray" p={2} display="block" whiteSpace="pre" overflowX="auto">
                      {log}
                    </Code>
                  ) : (
                    log
                  )}
                </Text>
              ))
            ) : (
              <Text color="gray.500">No logs available.</Text>
            )}
          </Box>
        ) : (
          <Box 
            bg="#FFFFFF" 
            p={4} 
            borderRadius="md" 
            height="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500">Select an operation to see logs</Text>
          </Box>
        )}
      </Box>
    </Box>
  )
} 