import json
import os
import numpy as np
from collections import Counter
from pathlib import Path
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_processed_files():
    """Load processed files from JSON"""
    try:
        with open("data/processed_files.json", "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading processed_files.json: {e}")
        return {}

def extract_all_tags(processed_files):
    """Extract all tags from the processed files"""
    all_tags = []
    for file_id, file_data in processed_files.items():
        if "tags" in file_data:
            all_tags.extend(file_data["tags"])
    return all_tags

def compute_tag_frequency(tags):
    """Compute the frequency of each tag"""
    return Counter(tags)

def get_unique_tags(tag_frequency):
    """Get the list of unique tags"""
    return list(tag_frequency.keys())

def compute_cooccurrence_matrix(processed_files, unique_tags):
    """Compute a matrix of tag co-occurrences"""
    tag_to_index = {tag: i for i, tag in enumerate(unique_tags)}
    n_tags = len(unique_tags)
    cooccurrence_matrix = np.zeros((n_tags, n_tags), dtype=int)
    
    for file_id, file_data in processed_files.items():
        if "tags" not in file_data:
            continue
            
        file_tags = file_data["tags"]
        # For each pair of tags in this file, increment co-occurrence
        for i, tag1 in enumerate(file_tags):
            if tag1 not in tag_to_index:
                continue
            idx1 = tag_to_index[tag1]
            for tag2 in file_tags[i+1:]:
                if tag2 not in tag_to_index:
                    continue
                idx2 = tag_to_index[tag2]
                cooccurrence_matrix[idx1, idx2] += 1
                cooccurrence_matrix[idx2, idx1] += 1  # Symmetric
    
    return cooccurrence_matrix

def save_results(unique_tags, tag_frequency, cooccurrence_matrix):
    """Save the taxonomy results to files"""
    # Create timestamp for filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save tag list and frequencies
    tag_data = {tag: count for tag, count in tag_frequency.items()}
    with open(f"data/tag_frequency_{timestamp}.json", "w") as f:
        json.dump(tag_data, f, indent=2)
    
    # Save tag list as text file for reference
    with open(f"data/unique_tags_{timestamp}.txt", "w") as f:
        for tag in unique_tags:
            f.write(f"{tag}\n")
    
    # Save frequency array
    frequency_array = np.array([tag_frequency[tag] for tag in unique_tags])
    np.save(f"data/tag_frequency_array_{timestamp}.npy", frequency_array)
    
    # Save co-occurrence matrix
    np.save(f"data/tag_cooccurrence_matrix_{timestamp}.npy", cooccurrence_matrix)
    
    # Also save a metadata file to keep track of the tag-to-index mapping
    tag_index_map = {i: tag for i, tag in enumerate(unique_tags)}
    with open(f"data/tag_index_map_{timestamp}.json", "w") as f:
        json.dump(tag_index_map, f, indent=2)
    
    logger.info(f"Taxonomy data saved with timestamp {timestamp}")
    return timestamp

def analyze_tag_relationships(tag_frequency, cooccurrence_matrix, unique_tags, timestamp):
    """Perform additional analysis on tag relationships"""
    # Normalize co-occurrence by frequency to find related tags
    n_tags = len(unique_tags)
    tag_relationship_strength = np.zeros((n_tags, n_tags), dtype=float)
    
    for i in range(n_tags):
        for j in range(n_tags):
            if i != j:
                # Normalize by the minimum frequency of the two tags
                min_freq = min(tag_frequency[unique_tags[i]], tag_frequency[unique_tags[j]])
                if min_freq > 0:
                    tag_relationship_strength[i, j] = cooccurrence_matrix[i, j] / min_freq
    
    # Find the strongest relationships for each tag
    strongest_relationships = {}
    for i, tag in enumerate(unique_tags):
        # Get indices of top 5 related tags (excluding self)
        related_indices = np.argsort(tag_relationship_strength[i])[-6:]
        related_indices = [idx for idx in related_indices if idx != i][:5]  # Exclude self, take top 5
        
        # Store the related tags and their strength
        related_tags = [(unique_tags[idx], tag_relationship_strength[i, idx]) 
                        for idx in related_indices]
        strongest_relationships[tag] = related_tags
    
    # Save the strongest relationships
    with open(f"data/tag_relationships_{timestamp}.json", "w") as f:
        json.dump(strongest_relationships, f, indent=2)
    
    # Calculate clusters of related tags using a simple threshold-based approach
    threshold = 0.5  # Tags that co-occur in at least 50% of cases
    tag_clusters = []
    visited = set()
    
    for i, tag in enumerate(unique_tags):
        if tag in visited:
            continue
            
        cluster = [tag]
        visited.add(tag)
        
        # Find all tags strongly related to this one
        for j, other_tag in enumerate(unique_tags):
            if other_tag != tag and other_tag not in visited:
                if tag_relationship_strength[i, j] >= threshold:
                    cluster.append(other_tag)
                    visited.add(other_tag)
        
        if len(cluster) > 1:  # Only save clusters with at least 2 tags
            tag_clusters.append(cluster)
    
    # Save the tag clusters
    with open(f"data/tag_clusters_{timestamp}.json", "w") as f:
        json.dump(tag_clusters, f, indent=2)
    
    logger.info(f"Tag relationship analysis completed and saved with timestamp {timestamp}")

def main():
    """Main function to generate tag taxonomy"""
    logger.info("Starting tag taxonomy generation")
    
    # Create data directory if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    # Load processed files
    processed_files = load_processed_files()
    if not processed_files:
        logger.error("No processed files found. Exiting.")
        return
    
    # Extract and analyze tags
    all_tags = extract_all_tags(processed_files)
    logger.info(f"Extracted {len(all_tags)} tags in total")
    
    tag_frequency = compute_tag_frequency(all_tags)
    unique_tags = get_unique_tags(tag_frequency)
    logger.info(f"Found {len(unique_tags)} unique tags")
    
    cooccurrence_matrix = compute_cooccurrence_matrix(processed_files, unique_tags)
    logger.info(f"Computed {cooccurrence_matrix.shape} co-occurrence matrix")
    
    # Save results
    timestamp = save_results(unique_tags, tag_frequency, cooccurrence_matrix)
    
    # Analyze tag relationships
    analyze_tag_relationships(tag_frequency, cooccurrence_matrix, unique_tags, timestamp)
    
    logger.info("Tag taxonomy generation completed successfully")

if __name__ == "__main__":
    main() 