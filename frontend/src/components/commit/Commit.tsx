import React, { useState, useEffect } from 'react'
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
  Checkbox,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  IconButton,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react'
import { callApi } from '../../utils/api'
import { Panel } from '../common/Panel'

// API endpoints
const API_ENDPOINTS = {
  processLatest: '/api/process-latest',
  processFolder: '/api/process-folder',
  generateTags: '/api/generate-tags',
  retitleLatest: '/api/retitle-latest',
  retitleFolder: '/api/retitle-folder',
  reclassifyDocuments: '/api/reclassify-documents',
  getLatestDriveFile: '/api/get-latest-drive-file',
  getUnprocessedFiles: '/api/get-unprocessed-files'
}

type OperationType = 'processLatest' | 'processFolder' | 'generateTags' | 'retitleLatest' | 'retitleFolder' | 'reclassifyDocuments' | null;

type DriveFile = {
  id: string;
  name: string;
  title?: string;
  createdTime: string;
  webViewLink?: string;
};

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
  const [processEntireFolder, setProcessEntireFolder] = useState(false);
  const [latestFile, setLatestFile] = useState<DriveFile | null>(null);
  const [unprocessedFiles, setUnprocessedFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState({
    latest: false,
    unprocessed: false
  });
  
  // Function to fetch latest file from Google Drive
  const fetchLatestFile = async () => {
    try {
      setIsLoadingFiles(prev => ({ ...prev, latest: true }));
      const response = await callApi(API_ENDPOINTS.getLatestDriveFile);
      if (response && response.file) {
        setLatestFile(response.file);
      }
    } catch (error) {
      console.error("Error fetching latest file:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch latest file from Google Drive',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingFiles(prev => ({ ...prev, latest: false }));
    }
  };
  
  // Function to fetch unprocessed files
  const fetchUnprocessedFiles = async () => {
    try {
      setIsLoadingFiles(prev => ({ ...prev, unprocessed: true }));
      const response = await callApi(API_ENDPOINTS.getUnprocessedFiles);
      if (response && response.files) {
        setUnprocessedFiles(response.files);
      }
    } catch (error) {
      console.error("Error fetching unprocessed files:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch unprocessed files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingFiles(prev => ({ ...prev, unprocessed: false }));
    }
  };
  
  // Fetch files on component mount
  useEffect(() => {
    fetchLatestFile();
    fetchUnprocessedFiles();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchLatestFile();
      fetchUnprocessedFiles();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
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
    
    // Refresh file lists after processing
    if (operation === 'processLatest' || operation === 'processFolder') {
      fetchLatestFile();
      fetchUnprocessedFiles();
    }
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
  
  // Function to process documents
  const processDocuments = () => {
    const operation = processEntireFolder ? 'processFolder' : 'processLatest';
    makeApiCall(operation);
  }
  
  // Function to format operation name for display
  const formatOperationName = (operation: string) => {
    return operation
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Card background color
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box p={4} bg="#FAFAFA">
      <Heading size="lg" mb={6}>Knowledge Processor</Heading>
      
      {/* Document Processing Operations */}
      <Panel title="DOCUMENT PROCESSING" mb={6} height="auto">
        <Flex direction="column" w="100%">
          {/* Process controls */}
          <Flex justify="space-between" align="center" mb={4}>
            <Checkbox 
              isChecked={processEntireFolder} 
              onChange={(e) => setProcessEntireFolder(e.target.checked)}
              colorScheme="gray"
            >
              Process entire folder
            </Checkbox>
            
            <Button 
              onClick={processDocuments} 
              isLoading={isLoading.processLatest || isLoading.processFolder}
              colorScheme="gray"
              size="md"
            >
              {processEntireFolder ? 'Process All Documents' : 'Process Latest Document'}
            </Button>
          </Flex>
          
          <Divider mb={4} />
          
          {/* Document info boxes */}
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            {/* Latest file box */}
            <Card variant="outline" bg={cardBg}>
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm">Latest Document in Drive</Heading>
                  <Tooltip label="Refresh">
                    <Button
                      size="sm"
                      variant="ghost"
                      isLoading={isLoadingFiles.latest}
                      onClick={fetchLatestFile}
                    >
                      Refresh
                    </Button>
                  </Tooltip>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingFiles.latest ? (
                  <VStack align="stretch" spacing={2}>
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                  </VStack>
                ) : latestFile ? (
                  <VStack align="stretch" spacing={1}>
                    <Text fontWeight="bold" noOfLines={2}>
                      {latestFile.title || latestFile.name}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Added: {formatDate(latestFile.createdTime)}
                    </Text>
                    {latestFile.webViewLink && (
                      <Text fontSize="sm">
                        <a href={latestFile.webViewLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>
                          View in Drive
                        </a>
                      </Text>
                    )}
                  </VStack>
                ) : (
                  <Text color="gray.500">No documents found in Drive</Text>
                )}
              </CardBody>
            </Card>
            
            {/* Unprocessed files box */}
            <Card variant="outline" bg={cardBg}>
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Heading size="sm">Unprocessed Documents</Heading>
                  <Tooltip label="Refresh">
                    <Button
                      size="sm"
                      variant="ghost"
                      isLoading={isLoadingFiles.unprocessed}
                      onClick={fetchUnprocessedFiles}
                    >
                      Refresh
                    </Button>
                  </Tooltip>
                </Flex>
              </CardHeader>
              <CardBody>
                {isLoadingFiles.unprocessed ? (
                  <VStack align="stretch" spacing={2}>
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                    <Skeleton height="20px" />
                  </VStack>
                ) : unprocessedFiles.length > 0 ? (
                  <Box maxH="200px" overflowY="auto">
                    <VStack align="stretch" spacing={3} divider={<Divider />}>
                      {unprocessedFiles.map(file => (
                        <Box key={file.id}>
                          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                            {file.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Added: {formatDate(file.createdTime)}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Text color="gray.500">All documents have been processed</Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        </Flex>
      </Panel>
      
      {/* Metadata Enhancement Operations */}
      <Panel title="METADATA ENHANCEMENT" mb={6} height="auto">
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
      </Panel>
      
      {/* Log Panel */}
      <Panel title="OPERATION LOGS" height="500px">
        <Flex justify="flex-end" mb={4}>
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
            height="350px" 
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
            height="350px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500">Select an operation to see logs</Text>
          </Box>
        )}
      </Panel>
    </Box>
  )
} 