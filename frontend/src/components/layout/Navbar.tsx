import React from 'react'
import { Box, Flex, Text, VStack, Button } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'

export const Navbar = () => {
  const location = useLocation()
  
  return (
    <>
      <Box 
        h="60px" 
        bg="background.primary" 
        borderBottom="1px solid" 
        borderColor="whiteAlpha.200"
      >
        <Flex 
          maxW="container.xl" 
          mx="auto" 
          h="100%" 
          px={4} 
          align="center"
        >
          <Text
            fontFamily="display"
            fontSize="2xl"
            fontWeight="bold"
            letterSpacing="0.05em"
            color="primary.main"
          >
            CORTEX
          </Text>
        </Flex>
      </Box>

      <Flex>
        {/* Main Menu */}
        <VStack 
          w="225px" 
          bg="background.primary" 
          borderRight="1px solid" 
          borderColor="whiteAlpha.200"
          p={2}
          spacing={1}
          align="stretch"
        >
          <Button
            as={Link}
            to="/"
            variant={location.pathname === '/' ? 'primary' : 'secondary'}
            justifyContent="flex-start"
            h="50px"
          >
            Home
          </Button>
          <Button
            as={Link}
            to="/explore"
            variant={location.pathname === '/explore' ? 'primary' : 'secondary'}
            justifyContent="flex-start"
            h="50px"
          >
            Explore
          </Button>
        </VStack>

        {/* Content Area */}
        <Box flex={1}>
          {/* Sub Menu */}
          <Box 
            h="50px" 
            bg="background.secondary"
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Flex 
              maxW="container.xl" 
              mx="auto" 
              h="100%" 
              px={4} 
              align="center"
            >
              {location.pathname === '/explore' && (
                <Flex gap={4}>
                  <Text color="text.primary">Table</Text>
                  <Text color="text.disabled">Graph</Text>
                  <Text color="text.disabled">Connectome</Text>
                </Flex>
              )}
            </Flex>
          </Box>
        </Box>
      </Flex>
    </>
  )
} 