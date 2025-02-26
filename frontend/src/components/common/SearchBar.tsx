import React from 'react'
import { 
  Box, 
  Input, 
  InputGroup, 
  InputLeftElement 
} from '@chakra-ui/react'

// Custom search icon component
export const SearchIconSvg = () => (
  <Box 
    as="svg" 
    width="16px" 
    height="16px" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </Box>
);

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ 
  placeholder = "Search...", 
  value, 
  onChange 
}: SearchBarProps) => {
  return (
    <Box mb={4} width="100%">
      <InputGroup width="100%">
        <InputLeftElement pointerEvents="none">
          <SearchIconSvg />
        </InputLeftElement>
        <Input 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          bg="#FFFFFF"
          border="1px solid rgba(100, 100, 100, 0.2)"
          _focus={{
            boxShadow: "0 0 0 1px rgba(100, 100, 100, 0.4)",
            borderColor: "rgba(100, 100, 100, 0.4)"
          }}
          width="100%"
        />
      </InputGroup>
    </Box>
  )
} 