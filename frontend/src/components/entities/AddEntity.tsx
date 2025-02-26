import React, { useState } from 'react';
import { 
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Typography, Paper, Grid, SelectChangeEvent
} from '@mui/material';

export default function AddEntity() {
  const [entityData, setEntityData] = useState({
    name: '',
    type: '',
    description: '',
    aliases: '',
    website: '',
  });
  
  const [errors, setErrors] = useState({
    name: false,
    type: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEntityData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setEntityData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      name: !entityData.name,
      type: !entityData.type,
    };
    
    setErrors(newErrors);
    
    // If no errors, submit the form
    if (!Object.values(newErrors).some(Boolean)) {
      console.log('Entity data submitted:', entityData);
      // Here you would typically send the data to your API
      alert('Entity added successfully!');
      
      // Reset form
      setEntityData({
        name: '',
        type: '',
        description: '',
        aliases: '',
        website: '',
      });
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Add New Entity</Typography>
      
      <Paper className="p-4">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Entity Name"
                name="name"
                value={entityData.name}
                onChange={handleChange}
                error={errors.name}
                helperText={errors.name ? "Name is required" : ""}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={errors.type}>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  name="type"
                  value={entityData.type}
                  label="Entity Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="organization">Organization</MenuItem>
                  <MenuItem value="person">Person</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={entityData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aliases (comma separated)"
                name="aliases"
                value={entityData.aliases}
                onChange={handleChange}
                placeholder="e.g. IBM, International Business Machines"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={entityData.website}
                onChange={handleChange}
                placeholder="e.g. https://example.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                className="mt-4"
              >
                Add Entity
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
} 