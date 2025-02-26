import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, TextField, InputAdornment 
} from '@mui/material';
import { Search } from '@mui/icons-react';

interface Document {
  id: string;
  title: string;
  date: string;
  source: string;
  tags: string[];
}

export default function ExploreDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in a real app, this would be fetched from an API
    const mockDocuments: Document[] = [
      { id: '1', title: 'Annual Report 2023', date: '2023-12-15', source: 'Company Website', tags: ['finance', 'annual report'] },
      { id: '2', title: 'Market Analysis Q2', date: '2023-06-30', source: 'Research Department', tags: ['market', 'analysis'] },
      { id: '3', title: 'Product Launch Memo', date: '2023-09-10', source: 'Marketing', tags: ['product', 'launch'] },
      { id: '4', title: 'Competitive Analysis', date: '2023-08-22', source: 'Strategy Team', tags: ['competition', 'analysis'] },
      { id: '5', title: 'Board Meeting Minutes', date: '2023-11-05', source: 'Corporate Secretary', tags: ['governance', 'board'] },
    ];
    
    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchTerm, documents]);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="p-4">
      <Typography variant="h5" className="mb-4">Documents</Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search documents..."
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
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Tags</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.source}</TableCell>
                  <TableCell>
                    {doc.tags.map(tag => (
                      <span key={tag} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1">
                        {tag}
                      </span>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No documents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
} 