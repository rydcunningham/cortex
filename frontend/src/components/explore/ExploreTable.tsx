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
  Tooltip,
  Link,
  Icon,
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

// Sort direction type
type SortDirection = 'asc' | 'desc';

// Sort key type
type SortKey = 'title' | 'authors' | 'created_date' | 'added_date';

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

// Sort icons
const SortAscIcon = () => <Box as="span" ml={1} fontSize="xs">▲</Box>;
const SortDescIcon = () => <Box as="span" ml={1} fontSize="xs">▼</Box>;

export const ExploreTable = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  
  // Add sorting state
  const [sortKey, setSortKey] = useState<SortKey>('added_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
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
  
  // Format date for display without date-fns
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Format authors list for display
  const formatAuthors = (authors: string[]) => {
    if (!authors || !authors.length) return 'Unknown';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
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
    if (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query))) return true;
    
    return false;
  });
  
  // Sort files based on current sort key and direction
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sortKey) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
        
      case 'authors':
        const authorA = a.authors && a.authors.length > 0 ? a.authors[0] : '';
        const authorB = b.authors && b.authors.length > 0 ? b.authors[0] : '';
        comparison = authorA.localeCompare(authorB);
        break;
        
      case 'created_date':
        const dateA = new Date(a.created_date || 0).getTime();
        const dateB = new Date(b.created_date || 0).getTime();
        comparison = dateA - dateB;
        break;
        
      case 'added_date':
        const addedA = new Date(a.added_date || 0).getTime();
        const addedB = new Date(b.added_date || 0).getTime();
        comparison = addedA - addedB;
        break;
        
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle header click for sorting
  const handleHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for a new column
      setSortKey(key);
      setSortDirection('desc');
    }
  };
  
  return (
    // Create a consistent width container for all content
    <Box p={4} width="100%">
      {/* Wrapper for consistent width between search and grid */}
      <Box width="100%">
        {/* Search Bar */}
        <Box mb={4} width="100%">
          <InputGroup width="100%">
            <InputLeftElement pointerEvents="none">
              <SearchIconSvg />
            </InputLeftElement>
            <Input 
              placeholder="Search by title, author, or tag..." 
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
        
        {/* Main Content Grid */}
        <Grid 
          templateColumns={selectedFile ? "65fr 33fr" : "1fr"} 
          gap={2} 
          width="100%"
        >
          {/* Files Table */}
          <GridItem width="100%">
            <Box {...panelStyle} width="100%" overflow="hidden">
              <Text color="#404040" mb={4} fontFamily="heading" fontSize="md" fontWeight="bold">
                DOCUMENTS ({filteredFiles.length})
              </Text>
              
              <Box 
                flex="1"
                overflowY="auto"
                overflowX="hidden"
                maxWidth="100%"
              >
                <Table variant="simple" size="sm" layout="fixed" width="100%">
                  <Thead position="sticky" top={0} bg="#F0F0F0" zIndex={1}>
                    <Tr>
                      <Th 
                        width="45%" 
                        borderColor="rgba(100, 100, 100, 0.05)"
                        cursor="pointer"
                        onClick={() => handleHeaderClick('title')}
                      >
                        <Flex align="center">
                          TITLE
                          {sortKey === 'title' && (
                            sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </Flex>
                      </Th>
                      <Th 
                        width="25%" 
                        borderColor="rgba(100, 100, 100, 0.05)"
                        cursor="pointer"
                        onClick={() => handleHeaderClick('authors')}
                      >
                        <Flex align="center">
                          AUTHORS
                          {sortKey === 'authors' && (
                            sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </Flex>
                      </Th>
                      <Th 
                        width="15%" 
                        borderColor="rgba(100, 100, 100, 0.05)"
                        cursor="pointer"
                        onClick={() => handleHeaderClick('created_date')}
                      >
                        <Flex align="center">
                          CREATED
                          {sortKey === 'created_date' && (
                            sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </Flex>
                      </Th>
                      <Th 
                        width="20%" 
                        borderColor="rgba(100, 100, 100, 0.05)"
                        cursor="pointer"
                        onClick={() => handleHeaderClick('added_date')}
                      >
                        <Flex align="center">
                          ADDED
                          {sortKey === 'added_date' && (
                            sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </Flex>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedFiles.map((file) => (
                      <Tr 
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        cursor="pointer"
                        _hover={{ bg: "rgba(100, 100, 100, 0.05)" }}
                        bg={selectedFile?.id === file.id ? "rgba(100, 100, 100, 0.1)" : "transparent"}
                      >
                        <Td width="45%" borderColor="rgba(100, 100, 100, 0.05)" py={3}>
                          <Tooltip label={file.title}>
                            <Text 
                              color="#000000" 
                              fontWeight={selectedFile?.id === file.id ? "medium" : "normal"}
                              noOfLines={2}
                            >
                              {file.title}
                            </Text>
                          </Tooltip>
                          
                          {file.tags && file.tags.length > 0 && (
                            <Flex mt={1} gap={1} flexWrap="wrap">
                              {file.tags.slice(0, 3).map((tag, idx) => (
                                <Badge 
                                  key={idx} 
                                  fontSize="2xs" 
                                  bg="rgba(100, 100, 100, 0.1)" 
                                  color="#505050"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length > 3 && (
                                <Badge 
                                  fontSize="2xs" 
                                  bg="rgba(100, 100, 100, 0.05)" 
                                  color="#505050"
                                >
                                  +{file.tags.length - 3}
                                </Badge>
                              )}
                            </Flex>
                          )}
                        </Td>
                        <Td width="25%" borderColor="rgba(100, 100, 100, 0.05)" py={3}>
                          <Text 
                            noOfLines={1}
                            fontSize="xs"
                            color="#505050"
                          >
                            {formatAuthors(file.authors)}
                          </Text>
                        </Td>
                        <Td width="15%" borderColor="rgba(100, 100, 100, 0.05)" py={3}>
                          <Text 
                            fontSize="xs"
                            color="#505050"
                          >
                            {formatDate(file.created_date)}
                          </Text>
                        </Td>
                        <Td width="20%" borderColor="rgba(100, 100, 100, 0.05)" py={3}>
                          <Text 
                            fontSize="xs"
                            color="#505050"
                          >
                            {formatDate(file.added_date)}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </GridItem>
          
          {/* Detail Panel */}
          {selectedFile && (
            <GridItem width="100%">
              <Box {...panelStyle} width="100%">
                <Text 
                  color="#404040" 
                  mb={2} 
                  fontFamily="heading" 
                  fontSize="md" 
                  fontWeight="bold"
                  noOfLines={2}
                >
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
    </Box>
  )
} 