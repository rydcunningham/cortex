import React, { useEffect, useState } from 'react';
import { Box, Text, Select, VStack, HStack, Badge } from '@chakra-ui/react';
import { ForceGraph2D } from 'react-force-graph';

const TagNetwork: React.FC = () => {
  // Simple mock data
  const graphData = {
    nodes: [
      { id: 'weightless-neural-networks', val: 5, group: 0 },
      { id: 'spiking-neural-networks', val: 3, group: 1 },
      { id: 'edge-computing', val: 2, group: 1 },
      { id: 'neuromorphic-computing', val: 4, group: 1 },
      { id: 'low-power-ai', val: 3, group: 2 },
      { id: 'energy-efficiency', val: 2, group: 2 }
    ],
    links: [
      { source: 'weightless-neural-networks', target: 'spiking-neural-networks', value: 0.7 },
      { source: 'weightless-neural-networks', target: 'edge-computing', value: 0.5 },
      { source: 'weightless-neural-networks', target: 'neuromorphic-computing', value: 0.8 },
      { source: 'spiking-neural-networks', target: 'low-power-ai', value: 0.6 },
      { source: 'edge-computing', target: 'energy-efficiency', value: 0.9 }
    ]
  };

  return (
    <Box w="100%" h="100%">
      <Box h="550px" border="1px solid" borderColor="rgba(0, 229, 255, 0.1)" borderRadius="md" bg="#0A1013">
        <ForceGraph2D
          graphData={graphData}
          nodeRelSize={6}
          nodeVal={(node) => node.val}
          nodeLabel={(node) => `${node.id}`}
          linkWidth={(link) => link.value * 3}
          linkColor={() => 'rgba(0, 229, 255, 0.3)'}
          backgroundColor="#0A1013"
          nodeColor={(node) => 
            node.group === 0 ? '#FF5E5B' : 
            node.group === 1 ? '#00E5FF' : 
            node.group === 2 ? '#5CDB95' : '#A6B1E1'
          }
          cooldownTicks={100}
        />
      </Box>
    </Box>
  );
};

export default TagNetwork; 