import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
  Badge,
  Flex,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Spacer,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

// Type definition for processed files - updated with analysis field
interface ProcessedFile {
  id: string;
  name: string;
  drive_link: string;
  created_date: string;
  added_date: string;
  processed_date: string;
  authors: string[];
  affiliations: string[];
  title: string;
  summary: string;
  tags: string[];
  analysis?: string; // Optional analysis field
}

// Custom search icon component
const SearchIconSvg = () => (
  <Box 
    as="svg" 
    width="16px" 
    height="16px" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </Box>
);

// Custom arrow icons for expand/collapse
const DownArrow = () => (
  <Box as="span" ml={1} lineHeight="1">
    ▼
  </Box>
);

const UpArrow = () => (
  <Box as="span" ml={1} lineHeight="1">
    ▲
  </Box>
);

export const ExploreTable = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  // Panel styling with grayscale theme
  const panelStyle = {
    bg: "#F0F0F0",  // Light gray background instead of dark
    borderRadius: "4px",
    border: "1px",
    borderColor: "rgba(100, 100, 100, 0.2)",  // Gray border instead of blue
    p: 4,
    height: "calc(100vh - 120px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  }
  
  // Function to get first 5 lines of text
  const getFirstFiveLines = (text: string) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.slice(0, 5).join('\n');
  };
  
  // Fetch the processed files data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching processed_files.json...');
        const response = await fetch('/data/processed_files.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', Object.keys(data).length, 'items');
        
        // Convert object to array
        const filesArray = Object.values(data) as ProcessedFile[];
        setFiles(filesArray);
      } catch (error) {
        console.error('Error fetching processed files:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Filter files based on search query
  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search in title
    if (file.title.toLowerCase().includes(query)) return true;
    
    // Search in authors
    if (file.authors.some(author => author.toLowerCase().includes(query))) return true;
    
    // Search in tags
    if (file.tags.some(tag => tag.toLowerCase().includes(query))) return true;
    
    // Search in summary
    if (file.summary.toLowerCase().includes(query)) return true;
    
    return false;
  });
  
  return (
    <Box p={3} pt={6} bg="#FAFAFA">
      <Grid templateColumns={selectedFile ? "3fr 2fr" : "1fr"} gap={3}>
        {/* Table Panel */}
        <GridItem>
          <Box {...panelStyle}>
            <Text color="#505050" mb={3} fontFamily="mono" fontSize="xs" fontWeight="bold">
              KNOWLEDGE BASE FILES ({loading ? "..." : filteredFiles.length}/{files.length})
            </Text>
            
            {/* Search Bar - updated with grayscale colors */}
            <InputGroup size="sm" mb={3}>
              <InputLeftElement pointerEvents="none" color="#707070">
                <SearchIconSvg />
              </InputLeftElement>
              <Input
                placeholder="Search by title, author, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="#FFFFFF"
                border="1px solid"
                borderColor="rgba(100, 100, 100, 0.2)"
                color="#333333"
                _focus={{
                  borderColor: "#707070",
                  boxShadow: "0 0 0 1px #707070",
                }}
                _hover={{
                  borderColor: "rgba(100, 100, 100, 0.4)",
                }}
                fontFamily="mono"
                fontSize="xs"
              />
            </InputGroup>
            
            <Box 
              flex="1"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0, 0, 0, 0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(100, 100, 100, 0.4)',
                  borderRadius: '2px',
                }
              }}
            >
              <Table variant="unstyled" size="sm">
                <Thead position="sticky" top={0} zIndex={1} bg="#E5E5E5">
                  <Tr>
                    <Th color="#606060" borderColor="rgba(100, 100, 100, 0.1)" fontFamily="mono" py={3}>TITLE</Th>
                    <Th color="#606060" borderColor="rgba(100, 100, 100, 0.1)" fontFamily="mono" py={3}>AUTHORS</Th>
                    <Th color="#606060" borderColor="rgba(100, 100, 100, 0.1)" fontFamily="mono" py={3}>ADDED</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={4}>
                        <Text color="#606060">Loading knowledge base...</Text>
                      </Td>
                    </Tr>
                  ) : filteredFiles.length === 0 ? (
                    <Tr>
                      <Td colSpan={3} textAlign="center" py={4}>
                        <Text color="#606060">No matching files found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    filteredFiles.map(file => (
                      <Tr 
                        key={file.id} 
                        _hover={{ bg: "rgba(100, 100, 100, 0.05)" }}
                        bg={selectedFile?.id === file.id ? "rgba(100, 100, 100, 0.1)" : "transparent"}
                        cursor="pointer"
                        onClick={() => setSelectedFile(file)}
                      >
                        <Td 
                          borderColor="rgba(100, 100, 100, 0.05)" 
                          fontFamily="mono" 
                          py={3} 
                          color={selectedFile?.id === file.id ? "#404040" : "#333333"}
                          fontWeight={selectedFile?.id === file.id ? "bold" : "normal"}
                        >
                          {file.title}
                        </Td>
                        <Td borderColor="rgba(100, 100, 100, 0.05)" fontFamily="mono" py={3} color="#555555">
                          {file.authors.slice(0, 2).join(', ')}
                          {file.authors.length > 2 && ' et al.'}
                        </Td>
                        <Td borderColor="rgba(100, 100, 100, 0.05)" fontFamily="mono" py={3} color="#555555">
                          {formatDate(file.added_date)}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </GridItem>
        
        {/* Detail Panel - Only shown when a file is selected */}
        {selectedFile && (
          <GridItem>
            <Box {...panelStyle}>
              <Text color="#404040" mb={2} fontFamily="heading" fontSize="md" fontWeight="bold">
                {selectedFile.title}
              </Text>
              
              <Flex mb={4} gap={2} flexWrap="wrap">
                <Badge bg="rgba(100, 100, 100, 0.1)" color="#505050" px={2} py={1} borderRadius="4px">
                  {formatDate(selectedFile.created_date)}
                </Badge>
                
                {selectedFile.authors.slice(0, 3).map((author, idx) => (
                  <Badge key={idx} bg="rgba(100, 100, 100, 0.1)" color="#505050" px={2} py={1} borderRadius="4px">
                    {author}
                  </Badge>
                ))}
                {selectedFile.authors.length > 3 && (
                  <Badge bg="rgba(100, 100, 100, 0.05)" color="#505050" px={2} py={1} borderRadius="4px">
                    +{selectedFile.authors.length - 3} more
                  </Badge>
                )}
              </Flex>
              
              {/* Make the rest of the content scrollable */}
              <Box 
                flex="1"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(100, 100, 100, 0.4)',
                    borderRadius: '2px',
                  }
                }}
              >
                <Text color="#606060" mb={2} fontFamily="mono" fontSize="xs" fontWeight="bold">
                  SUMMARY
                </Text>
                
                <Box 
                  bg="#FFFFFF"
                  p={3} 
                  borderRadius="4px" 
                  fontFamily="mono"
                  fontSize="xs"
                  color="#333333"
                  whiteSpace="pre-wrap"
                  mb={4}
                  boxShadow="inset 0 0 2px rgba(0,0,0,0.05)"
                >
                  {selectedFile.summary}
                </Box>
                
                {/* Analysis Section - updated with new layout */}
                {selectedFile.analysis && (
                  <>
                    <Flex alignItems="center" mb={2}>
                      <Text color="#606060" fontFamily="mono" fontSize="xs" fontWeight="bold">
                        ANALYSIS
                      </Text>
                      <Spacer />
                      <Button
                        size="xs"
                        variant="ghost"
                        color="#606060"
                        fontFamily="mono"
                        fontSize="10px"
                        height="auto"
                        padding="2px 4px"
                        minWidth="0"
                        onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                        _hover={{ 
                          bg: "rgba(100, 100, 100, 0.05)",
                        }}
                        display="flex"
                        alignItems="center"
                      >
                        {showFullAnalysis ? (
                          <>SHOW LESS<UpArrow /></>
                        ) : (
                          <>SHOW MORE<DownArrow /></>
                        )}
                      </Button>
                    </Flex>
                    
                    {showFullAnalysis && (
                      <Box 
                        bg="#FFFFFF"
                        p={3} 
                        borderRadius="4px" 
                        fontFamily="mono"
                        fontSize="xs"
                        color="#333333"
                        whiteSpace="pre-wrap"
                        mb={4}
                        boxShadow="inset 0 0 2px rgba(0,0,0,0.05)"
                      >
                        {selectedFile.analysis}
                      </Box>
                    )}
                  </>
                )}
                
                <Text color="#606060" mb={2} fontFamily="mono" fontSize="xs" fontWeight="bold">
                  TAGS
                </Text>
                
                <Wrap spacing={2} mb={3}>
                  {selectedFile.tags.map((tag, idx) => (
                    <WrapItem key={idx}>
                      <Tag size="sm" bg="rgba(100, 100, 100, 0.1)" color="#505050" borderRadius="full">
                        <TagLabel>{tag}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
                
                <Text color="#606060" mb={2} fontFamily="mono" fontSize="xs" fontWeight="bold">
                  AFFILIATIONS
                </Text>
                
                <Box 
                  bg="#FFFFFF"
                  p={3} 
                  borderRadius="4px" 
                  fontFamily="mono"
                  fontSize="xs"
                  color="#555555"
                  mb={4}
                  boxShadow="inset 0 0 2px rgba(0,0,0,0.05)"
                >
                  {selectedFile.affiliations.join(', ')}
                </Box>
                
                <Flex justifyContent="flex-end" mb={2}>
                  <Box 
                    as="a" 
                    href={selectedFile.drive_link} 
                    target="_blank"
                    rel="noopener noreferrer"
                    color="#505050"
                    fontSize="xs"
                    fontFamily="mono"
                    _hover={{ 
                      textDecoration: 'underline',
                      color: "#333333"
                    }}
                  >
                    VIEW ORIGINAL →
                  </Box>
                </Flex>
              </Box>
            </Box>
          </GridItem>
        )}
      </Grid>
    </Box>
  )
} 