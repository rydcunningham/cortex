import React, { ReactNode } from 'react'
import { Box, Text, BoxProps } from '@chakra-ui/react'

interface PanelProps extends BoxProps {
  title?: string;
  children: ReactNode;
}

export const Panel = ({ 
  title, 
  children, 
  ...rest 
}: PanelProps) => {
  return (
    <Box
      bg="#F0F0F0"
      borderRadius="4px"
      border="1px"
      borderColor="rgba(100, 100, 100, 0.2)"
      p={4}
      height="calc(100vh - 120px)"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      {...rest}
    >
      {title && (
        <Text color="#404040" mb={4} fontFamily="heading" fontSize="md" fontWeight="bold">
          {title}
        </Text>
      )}
      
      <Box 
        flex="1"
        overflowY="auto"
        overflowX="hidden"
        maxWidth="100%"
      >
        {children}
      </Box>
    </Box>
  )
} 