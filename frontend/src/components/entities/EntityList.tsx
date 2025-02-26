import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, TextField, InputAdornment 
} from '@mui/material';
import { Search } from '@mui/icons-react';

interface Entity {
  id: string;
  name: string;
  type: 'company' | 'organization' | 'person';
  description?: string;
  documentCount: number;
}

interface EntityListProps {
  type: 'company' | 'organization' | 'person';
}

export default function EntityList({ type }: EntityListProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockEntities: Entity[] = [
      { id: '1', name: 'Acme Corp', type: 'company', description: 'Technology company', documentCount: 15 },
      { id: '2', name: 'John Doe', type: 'person', description: 'CEO', documentCount: 8 },
      { id: '3', name: 'United Nations', type: 'organization', description: 'International organization', documentCount: 12 },
      { id: '4', name: 'Jane Smith', type: 'person', description: 'Researcher', documentCount: 5 },
      { id: '5', name: 'Tech Innovations', type: 'company', description: 'R&D firm', documentCount: 10 },
      { id: '6', name: 'World Health Organization', type: 'organization', description: 'Health agency', documentCount: 7 },
    ];
    
    // Filter entities by type
    const typeFilteredEntities = mockEntities.filter(entity => entity.type === type);
    setEntities(typeFilteredEntities);
    setFilteredEntities(typeFilteredEntities);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = entities.filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.description && entity.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEntities(filtered);
    } else {
      setFilteredEntities(entities);
    }
  }, [searchTerm, entities]);

  const getTypeTitle = () => {
    switch (type) {
      case 'company':
        return 'Companies';
      case 'organization':
        return 'Organizations';
      case 'person':
        return 'People';
      default:
        return 'Entities';
    }
  };

  if (loading) {
    return <div>Loading entities...</div>;
  }

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">{getTypeTitle()}</Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder={`Search ${getTypeTitle().toLowerCase()}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Document Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntities.length > 0 ? (
              filteredEntities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell>{entity.description || '-'}</TableCell>
                  <TableCell align="right">{entity.documentCount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No {getTypeTitle().toLowerCase()} found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 