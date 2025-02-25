import React from 'react'
import { 
  Box, 
  Text,
  VStack,
  Input,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Heading,
} from '@chakra-ui/react'

export const Commit = () => {
  // Panel styling with grayscale theme
  const panelStyle = {
    bg: "#F0F0F0",
    borderRadius: "4px",
    border: "1px",
    borderColor: "rgba(100, 100, 100, 0.2)",
    p: 4,
  }
  
  return (
    <Box p={8}>
      <Heading size="lg">Commit Page</Heading>
      <Text mt={4}>This is the commit page content.</Text>
    </Box>
  )
} 