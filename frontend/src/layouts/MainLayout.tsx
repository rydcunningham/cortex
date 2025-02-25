import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Home } from '../components/home/Home'
import { Commit } from '../components/commit/Commit'
import { ExploreTable } from '../components/explore/ExploreTable'
import { ExploreGraph } from '../components/explore/ExploreGraph'
import { ExploreConnectome } from '../components/explore/ExploreConnectome'

export const MainLayout = () => {
  return (
    <Flex minH="100vh" bg="#F8F8F8">
      {/* Sidebar - exact width from screenshot */}
      <Box w="225px" h="100vh" position="fixed" top={0} left={0} zIndex={10}>
        <Sidebar />
      </Box>
      
      {/* Main Content - adjust margin to match sidebar exactly */}
      <Box flex={1} ml="225px" p={0}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/commit" element={<Commit />} />
          <Route path="/explore" element={<Navigate to="/explore/table" replace />} />
          <Route path="/explore/table" element={<ExploreTable />} />
          <Route path="/explore/graph" element={<ExploreGraph />} />
          <Route path="/explore/connectome" element={<ExploreConnectome />} />
        </Routes>
      </Box>
    </Flex>
  )
} 