import React from 'react'
import { Box, VStack, Text, Button } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'

export const Sidebar = () => {
  const location = useLocation()
  const currentPath = location.pathname
  
  // Is the user on any explore page?
  const isExplore = currentPath.startsWith('/explore')
  
  // Button styling with grayscale theme
  const buttonStyle = {
    fontFamily: "mono",
    justifyContent: "flex-start",
    fontSize: "13px",
    fontWeight: "400",
    borderRadius: "4px",
    height: "38px",
    paddingX: 4,
    marginY: "1px",
    bg: "transparent",
    color: "#505050",
    _hover: { bg: "rgba(100, 100, 100, 0.05)", color: "#333333" }
  }
  
  const activeButtonStyle = {
    ...buttonStyle,
    bg: "rgba(100, 100, 100, 0.1)",
    color: "#333333",
    fontWeight: "600"
  }
  
  return (
    <Box h="100%" bg="#EFEFEF">
      {/* Top section: CORTEX logo */}
      <Box 
        borderBottom="1px solid rgba(100, 100, 100, 0.2)" 
        py={6}
        px={4}
        mb={2}
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          fontFamily="heading"
          letterSpacing="tight"
          color="#333333"
        >
          CORTEX
        </Text>
      </Box>
      
      {/* Middle section: Main menu */}
      <Box py={3} px={2} borderBottom="1px solid rgba(100, 100, 100, 0.2)">
        <VStack align="stretch" spacing={0}>
          <Button
            as={Link}
            to="/"
            {...(currentPath === '/' ? activeButtonStyle : buttonStyle)}
          >
            HOME
          </Button>
          
          <Button
            as={Link}
            to="/commit"
            {...(currentPath === '/commit' ? activeButtonStyle : buttonStyle)}
          >
            COMMIT
          </Button>
          
          <Button
            as={Link}
            to="/explore"
            {...(isExplore ? activeButtonStyle : buttonStyle)}
          >
            EXPLORE
          </Button>
        </VStack>
      </Box>
      
      {/* Bottom section: Explore sub-menu (only shown when on explore pages) */}
      {isExplore && (
        <Box py={3} px={2}>
          <VStack align="stretch" spacing={0}>
            <Button
              as={Link}
              to="/explore/table"
              {...(currentPath === '/explore/table' ? activeButtonStyle : buttonStyle)}
            >
              TABLE
            </Button>
            
            <Button
              as={Link}
              to="/explore/graph"
              {...(currentPath === '/explore/graph' ? activeButtonStyle : buttonStyle)}
            >
              GRAPH
            </Button>
            
            <Button
              as={Link}
              to="/explore/connectome"
              {...(currentPath === '/explore/connectome' ? activeButtonStyle : buttonStyle)}
            >
              CONNECTOME
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  )
} 