import React, { useState } from 'react'
import { 
  VStack, 
  Input, 
  Button, 
  Text,
  useToast
} from '@chakra-ui/react'

export const UrlInput = () => {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Implement API call to submit URL
      toast({
        title: "URL submitted",
        description: "The webpage will be processed and added to the knowledge base",
        status: "success",
        duration: 5000,
      })
      setUrl('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit URL",
        status: "error",
        duration: 5000,
      })
    }
    setIsSubmitting(false)
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text color="text.secondary">
        Enter a URL to add its contents to the knowledge base
      </Text>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        bg="background.secondary"
        border="1px solid"
        borderColor="whiteAlpha.200"
        _focus={{
          borderColor: "primary.main",
          boxShadow: "0 0 0 1px #00E5FF"
        }}
      />
      <Button
        variant="primary"
        onClick={handleSubmit}
        isLoading={isSubmitting}
      >
        Submit URL
      </Button>
    </VStack>
  )
} 