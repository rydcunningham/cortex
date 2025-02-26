import React, { useState, useEffect, useRef } from 'react';
import { Typography, Paper, Slider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ForceGraph2D from 'react-force-graph-2d';

interface Node {
  id: string;
  name: string;
  val: number;
  color?: string;
  group?: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export default function ExploreTopics() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [nodeSize, setNodeSize] = useState<number>(1);
  const [linkStrength, setLinkStrength] = useState<number>(1);
  const [colorBy, setColorBy] = useState<string>('group');
  
  const graphRef = useRef<any>(null);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockNodes: Node[] = [
      { id: 'topic1', name: 'Artificial Intelligence', val: 20, group: 'technology' },
      { id: 'topic2', name: 'Machine Learning', val: 15, group: 'technology' },
      { id: 'topic3', name: 'Neural Networks', val: 10, group: 'technology' },
      { id: 'topic4', name: 'Data Science', val: 12, group: 'technology' },
      { id: 'topic5', name: 'Climate Change', val: 18, group: 'environment' },
      { id: 'topic6', name: 'Renewable Energy', val: 14, group: 'environment' },
      { id: 'topic7', name: 'Carbon Emissions', val: 8, group: 'environment' },
      { id: 'topic8', name: 'Global Warming', val: 16, group: 'environment' },
      { id: 'topic9', name: 'Market Analysis', val: 13, group: 'business' },
      { id: 'topic10', name: 'Financial Reports', val: 11, group: 'business' },
      { id: 'topic11', name: 'Investment Strategy', val: 9, group: 'business' },
      { id: 'topic12', name: 'Risk Management', val: 7, group: 'business' },
    ];
    
    const mockLinks: Link[] = [
      { source: 'topic1', target: 'topic2', value: 5 },
      { source: 'topic1', target: 'topic3', value: 4 },
      { source: 'topic2', target: 'topic3', value: 8 },
      { source: 'topic2', target: 'topic4', value: 6 },
      { source: 'topic3', target: 'topic4', value: 7 },
      { source: 'topic5', target: 'topic6', value: 9 },
      { source: 'topic5', target: 'topic7', value: 7 },
      { source: 'topic5', target: 'topic8', value: 10 },
      { source: 'topic6', target: 'topic7', value: 6 },
      { source: 'topic7', target: 'topic8', value: 8 },
      { source: 'topic9', target: 'topic10', value: 5 },
      { source: 'topic9', target: 'topic11', value: 4 },
      { source: 'topic10', target: 'topic11', value: 7 },
      { source: 'topic11', target: 'topic12', value: 6 },
      { source: 'topic4', target: 'topic9', value: 3 }, // Cross-group link
      { source: 'topic6', target: 'topic11', value: 2 }, // Cross-group link
    ];
    
    setGraphData({ nodes: mockNodes, links: mockLinks });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('link').strength(link => link.value * 0.01 * linkStrength);
      graphRef.current.d3Force('charge').strength(-50 * nodeSize);
    }
  }, [nodeSize, linkStrength]);

  const getNodeColor = (node: Node) => {
    if (colorBy === 'group') {
      switch (node.group) {
        case 'technology':
          return '#4285F4'; // Blue
        case 'environment':
          return '#34A853'; // Green
        case 'business':
          return '#FBBC05'; // Yellow
        default:
          return '#EA4335'; // Red
      }
    } else {
      // Color by node value
      const minVal = Math.min(...graphData.nodes.map(n => n.val));
      const maxVal = Math.max(...graphData.nodes.map(n => n.val));
      const normalizedVal = (node.val - minVal) / (maxVal - minVal);
      
      // Interpolate between blue and red
      const r = Math.floor(normalizedVal * 255);
      const b = Math.floor((1 - normalizedVal) * 255);
      return `rgb(${r}, 100, ${b})`;
    }
  };

  const handleColorByChange = (event: SelectChangeEvent) => {
    setColorBy(event.target.value);
  };

  if (loading) {
    return <div>Loading topic graph...</div>;
  }

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Topics Network</Typography>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <Paper className="p-3 flex-1">
          <Typography gutterBottom>Node Size</Typography>
          <Slider
            value={nodeSize}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(_, value) => setNodeSize(value as number)}
            valueLabelDisplay="auto"
          />
        </Paper>
        
        <Paper className="p-3 flex-1">
          <Typography gutterBottom>Link Strength</Typography>
          <Slider
            value={linkStrength}
            min={0.1}
            max={3}
            step={0.1}
            onChange={(_, value) => setLinkStrength(value as number)}
            valueLabelDisplay="auto"
          />
        </Paper>
        
        <Paper className="p-3 flex-1">
          <FormControl fullWidth>
            <InputLabel>Color By</InputLabel>
            <Select
              value={colorBy}
              label="Color By"
              onChange={handleColorByChange}
            >
              <MenuItem value="group">Group</MenuItem>
              <MenuItem value="value">Value</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </div>
      
      <Paper className="p-0 overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="name"
          nodeRelSize={nodeSize * 5}
          nodeVal={node => (node as Node).val}
          nodeColor={node => getNodeColor(node as Node)}
          linkWidth={link => (link as Link).value * 0.2}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={link => (link as Link).value * 0.1 * linkStrength}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400)}
        />
      </Paper>
      
      <div className="mt-4">
        <Typography variant="h6" className="mb-2">Legend</Typography>
        <div className="flex flex-wrap gap-4">
          {colorBy === 'group' ? (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#4285F4' }}></div>
                <span>Technology</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#34A853' }}></div>
                <span>Environment</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FBBC05' }}></div>
                <span>Business</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: 'rgb(0, 100, 255)' }}></div>
                <span>Low Value</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: 'rgb(128, 100, 128)' }}></div>
                <span>Medium Value</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: 'rgb(255, 100, 0)' }}></div>
                <span>High Value</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 