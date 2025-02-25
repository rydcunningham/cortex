import React, { useCallback, useState } from 'react'
import { 
  Box, 
  VStack, 
  Text, 
  Button,
  useToast
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'

export const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const toast = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      // TODO: Implement file upload to Google Drive
      toast({
        title: "Files uploaded",
        description: "Your files will be processed and added to the knowledge base",
        status: "success",
        duration: 5000,
      })
      setFiles([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        status: "error",
        duration: 5000,
      })
    }
    setIsUploading(false)
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box
        {...getRootProps()}
        p={10}
        bg="background.secondary"
        borderRadius="md"
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragActive ? "primary.main" : "whiteAlpha.300"}
        cursor="pointer"
        _hover={{
          borderColor: "primary.main"
        }}
      >
        <input {...getInputProps()} />
        <Text textAlign="center" color="text.secondary">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop PDF files here, or click to select files"}
        </Text>
      </Box>

      {files.length > 0 && (
        <VStack align="stretch" spacing={2}>
          <Text color="text.secondary">Selected files:</Text>
          {files.map(file => (
            <Text key={file.name} color="text.primary">{file.name}</Text>
          ))}
          <Button
            variant="primary"
            onClick={handleUpload}
            isLoading={isUploading}
          >
            Upload Files
          </Button>
        </VStack>
      )}
    </VStack>
  )
} 