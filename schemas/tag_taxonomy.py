from pydantic import BaseModel, Field
from typing import Dict, List, Tuple, Optional
import numpy as np
from datetime import datetime

class TagFrequency(BaseModel):
    """Schema for tag frequency data"""
    timestamp: str = Field(..., description="Timestamp when analysis was performed")
    frequencies: Dict[str, int] = Field(..., description="Dictionary mapping tags to their frequency counts")
    
    class Config:
        arbitrary_types_allowed = True

class TagRelationship(BaseModel):
    """Schema for relationships between tags"""
    tag: str = Field(..., description="The tag name")
    related_tags: List[Tuple[str, float]] = Field(..., description="List of related tags with relationship strength")

class TagCluster(BaseModel):
    """Schema for clusters of related tags"""
    tags: List[str] = Field(..., description="List of tags in this cluster")

class TagTaxonomy(BaseModel):
    """Complete tag taxonomy schema"""
    timestamp: str = Field(..., description="Timestamp when analysis was performed")
    unique_tags: List[str] = Field(..., description="List of all unique tags")
    frequencies: Dict[str, int] = Field(..., description="Dictionary mapping tags to their frequency counts")
    relationships: Dict[str, List[Tuple[str, float]]] = Field(..., description="Dictionary mapping tags to their related tags")
    clusters: List[List[str]] = Field(..., description="List of tag clusters")
    
    @classmethod
    def load_latest(cls):
        """Load the latest tag taxonomy data"""
        # This is a placeholder - implementation would search for latest files
        # and load/construct the taxonomy object
        pass 