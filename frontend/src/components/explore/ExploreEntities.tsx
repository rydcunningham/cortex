import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Chip, Avatar } from '@mui/material';
import { Business, Person, AccountBalance } from '@mui/icons-react';

interface Entity {
  id: string;
  name: string;
  type: 'company' | 'organization' | 'person';
  description?: string;
  documentCount: number;
}

export default function ExploreEntities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockEntities: Entity[] = [
      { id: '1', name: 'Acme Corp', type: 'company', description: 'Technology company', documentCount: 15 },
      { id: '2', name: 'John Doe', type: 'person', description: 'CEO', documentCount: 8 },
      { id: '3', name: 'United Nations', type: 'organization', description: 'International organization', documentCount: 12 },
      { id: '4', name: 'Jane Smith', type: 'person', description: 'Researcher', documentCount: 5 },
      { id: '5', name: 'Tech Innovations', type: 'company', description: 'R&D firm', documentCount: 10 },
    ];
    
    setEntities(mockEntities);
    setLoading(false);
  }, []);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Business />;
      case 'person':
        return <Person />;
      case 'organization':
        return <AccountBalance />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading entities...</div>;
  }

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Entities Overview</Typography>
      
      <Grid container spacing={3}>
        {entities.map((entity) => (
          <Grid item xs={12} sm={6} md={4} key={entity.id}>
            <Card>
              <CardContent>
                <div className="flex items-center mb-2">
                  <Avatar className="mr-2">
                    {getEntityIcon(entity.type)}
                  </Avatar>
                  <Typography variant="h6">{entity.name}</Typography>
                </div>
                
                <Chip 
                  label={entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} 
                  size="small" 
                  className="mb-2" 
                />
                
                {entity.description && (
                  <Typography variant="body2" color="textSecondary" className="mb-2">
                    {entity.description}
                  </Typography>
                )}
                
                <Typography variant="body2">
                  Appears in {entity.documentCount} document{entity.documentCount !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
} 