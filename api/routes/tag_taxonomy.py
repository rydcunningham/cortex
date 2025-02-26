from fastapi import APIRouter, HTTPException
import os
import json
from glob import glob
from typing import List, Dict, Any

router = APIRouter()

@router.get("/api/tag-taxonomy/latest")
async def get_latest_taxonomy():
    """Get the latest tag taxonomy data"""
    # Find the latest timestamp from the saved files
    frequency_files = glob("data/tag_frequency_*.json")
    if not frequency_files:
        raise HTTPException(status_code=404, detail="No tag taxonomy data found")
    
    # Extract timestamps and find the latest
    timestamps = [f.split("tag_frequency_")[1].split(".json")[0] for f in frequency_files]
    latest_timestamp = max(timestamps)
    
    # Load all the relevant files
    try:
        with open(f"data/tag_frequency_{latest_timestamp}.json", "r") as f:
            frequencies = json.load(f)
        
        with open(f"data/tag_index_map_{latest_timestamp}.json", "r") as f:
            tag_index_map = json.load(f)
            # Convert string keys to integers
            tag_index_map = {int(k): v for k, v in tag_index_map.items()}
        
        with open(f"data/tag_relationships_{latest_timestamp}.json", "r") as f:
            relationships = json.load(f)
        
        with open(f"data/tag_clusters_{latest_timestamp}.json", "r") as f:
            clusters = json.load(f)
        
        # Construct the full taxonomy object
        taxonomy = {
            "timestamp": latest_timestamp,
            "unique_tags": list(frequencies.keys()),
            "frequencies": frequencies,
            "relationships": relationships,
            "clusters": clusters
        }
        
        return taxonomy
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading taxonomy data: {str(e)}")

@router.get("/api/tag-taxonomy/history")
async def get_taxonomy_history():
    """Get a list of all available tag taxonomy timestamps"""
    frequency_files = glob("data/tag_frequency_*.json")
    timestamps = [f.split("tag_frequency_")[1].split(".json")[0] for f in frequency_files]
    timestamps.sort(reverse=True)  # Most recent first
    
    return {"timestamps": timestamps}

@router.get("/api/tag-taxonomy/{timestamp}")
async def get_taxonomy_by_timestamp(timestamp: str):
    """Get tag taxonomy data for a specific timestamp"""
    if not os.path.exists(f"data/tag_frequency_{timestamp}.json"):
        raise HTTPException(status_code=404, detail=f"Taxonomy data for timestamp {timestamp} not found")
    
    try:
        with open(f"data/tag_frequency_{timestamp}.json", "r") as f:
            frequencies = json.load(f)
        
        with open(f"data/tag_index_map_{timestamp}.json", "r") as f:
            tag_index_map = json.load(f)
            # Convert string keys to integers
            tag_index_map = {int(k): v for k, v in tag_index_map.items()}
        
        with open(f"data/tag_relationships_{timestamp}.json", "r") as f:
            relationships = json.load(f)
        
        with open(f"data/tag_clusters_{timestamp}.json", "r") as f:
            clusters = json.load(f)
        
        # Construct the full taxonomy object
        taxonomy = {
            "timestamp": timestamp,
            "unique_tags": list(frequencies.keys()),
            "frequencies": frequencies,
            "relationships": relationships,
            "clusters": clusters
        }
        
        return taxonomy
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading taxonomy data: {str(e)}") 