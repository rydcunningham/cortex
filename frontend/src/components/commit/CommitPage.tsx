import React from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { UrlInput } from './UrlInput'
import { FileUpload } from './FileUpload'

export const CommitPage = () => {
  return (
    <Box bg="background.panel" p={6} borderRadius="md" borderColor="whiteAlpha.200" borderWidth={1}>
      <Tabs variant="enclosed" colorScheme="cyan">
        <TabList mb={4}>
          <Tab>URL Submission</Tab>
          <Tab>File Upload</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <UrlInput />
          </TabPanel>
          <TabPanel>
            <FileUpload />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
} 