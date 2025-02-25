import React from 'react'
import { 
  Box, 
  Grid, 
  GridItem, 
  Text, 
  Flex,
} from '@chakra-ui/react'

export const Home = () => {
  // Stats data to match the reference image
  const stats = [
    { label: 'Token Throughput', value: '4.2M', baseline: '5.0M', unit: 'tokens per second', percentage: '84%', percentColor: 'cyber-green' },
    { label: 'GPU Utilization', value: '89.4', baseline: '95.0', unit: 'percent', percentage: '94%', percentColor: 'cyber-green' },
    { label: 'Active Users', value: '2,847', unit: 'concurrent users', percentage: '112%', percentColor: 'cyber-red' },
    { label: 'P99 Latency', value: '450', baseline: '500', unit: 'milliseconds', percentage: '90%', percentColor: 'cyber-green' },
    { label: 'Cost per 1M', value: '$0.92', baseline: '$0.85', unit: 'USD', percentage: '108%', percentColor: 'cyber-red' },
  ]
  
  // Panel styling to match reference exactly
  const panelStyle = {
    bg: "#0A0E11", // Slightly lighter than pure black
    borderRadius: "4px",
    border: "1px",
    borderColor: "rgba(0, 229, 255, 0.15)",
    p: 3,
  }
  
  return (
    <Box p={3} pt={6}> {/* Increased top padding to match reference */}
      {/* Stat Cards - Match exact layout from reference */}
      <Grid templateColumns="repeat(5, 1fr)" gap={3} mb={4}>
        {stats.map((stat, idx) => (
          <GridItem key={idx}>
            <Box {...panelStyle}>
              <Flex justify="space-between" mb={1}>
                <Text color="cyber-text" fontSize="xs" fontWeight="normal">{stat.label}</Text>
                <Text color={stat.percentColor} fontSize="xs">{stat.percentage}</Text>
              </Flex>
              
              <Text 
                color="cyber-blue" 
                fontSize="2xl" 
                fontFamily="heading" 
                lineHeight="1"
                fontWeight="500"
              >
                {stat.value}
              </Text>
              
              <Flex gap={1} align="baseline">
                {stat.baseline && (
                  <Text color="cyber-text" fontSize="sm">/ {stat.baseline}</Text>
                )}
              </Flex>
              
              <Text color="cyber-text" fontSize="xs" mt={1} opacity={0.7}>
                {stat.unit}
              </Text>
            </Box>
          </GridItem>
        ))}
      </Grid>
      
      {/* Main chart panels */}
      <Grid templateColumns="repeat(2, 1fr)" gap={3} mb={3}>
        <GridItem>
          <Box {...panelStyle}>
            <Text color="cyber-text" mb={3} fontFamily="mono" fontSize="xs">
              TOKEN THROUGHPUT
            </Text>
            
            {/* Line chart placeholder */}
            <Box 
              h="180px" 
              bg="black" 
              borderRadius="4px"
              position="relative"
              overflow="hidden"
            >
              {/* Simulated line chart */}
              <Box
                position="absolute"
                top="50%"
                left="0"
                right="0"
                height="2px"
                bg="cyber-blue"
                transform="translateY(-50%) scaleY(0.8) scaleX(0.95)"
                sx={{
                  maskImage: 'linear-gradient(90deg, transparent 0%, #00E5FF 5%, #00E5FF 95%, transparent 100%)',
                }}
              />
            </Box>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box {...panelStyle}>
            <Text color="cyber-text" mb={3} fontFamily="mono" fontSize="xs">
              GPU UTILIZATION VS USERS
            </Text>
            
            {/* Dual line chart placeholder */}
            <Box 
              h="180px" 
              bg="black" 
              borderRadius="4px"
              position="relative"
              overflow="hidden"
            >
              {/* Simulated dual line chart */}
              <Box
                position="absolute"
                top="30%"
                left="0"
                right="0"
                height="2px"
                bg="cyber-blue"
                transform="translateY(-50%) scaleY(0.8) scaleX(0.95)"
                sx={{
                  maskImage: 'linear-gradient(90deg, transparent 0%, #00E5FF 5%, #00E5FF 95%, transparent 100%)',
                }}
              />
              <Box
                position="absolute"
                top="60%"
                left="0"
                right="0"
                height="2px"
                bg="cyber-green"
                transform="translateY(-50%) scaleY(0.8) scaleX(0.95)"
                sx={{
                  maskImage: 'linear-gradient(90deg, transparent 0%, #00FF66 5%, #00FF66 95%, transparent 100%)',
                }}
              />
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  )
} 