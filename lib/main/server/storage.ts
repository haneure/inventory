import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readSheet, appendToSheet, updateRow, deleteRow, getRowById } from '../utils/excel';

const router = express.Router();

// Get all storage locations
router.get('/storage', (req, res) => {
  try {
    console.log('Fetching all storage locations');
    const storageLocations = readSheet('Storage');
    res.json({ success: true, data: storageLocations });
  } catch (error) {
    console.error('Error fetching storage locations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch storage locations' });
  }
});

// Get a single storage location by ID
router.get('/storage/:id', (req, res) => {
  try {
    const { id } = req.params;
    const storageLocation = getRowById('Storage', id);
    
    if (storageLocation) {
      res.json({ success: true, data: storageLocation });
    } else {
      res.status(404).json({ success: false, message: 'Storage location not found' });
    }
  } catch (error) {
    console.error('Error fetching storage location:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch storage location' });
  }
});

// Add a new storage location
router.post('/storage', (req, res) => {
  try {
    const { name, location } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    
    // Create new storage location
    const newStorage = {
      id: uuidv4(),
      name,
      location: location || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to Excel
    appendToSheet('Storage', newStorage);
    
    res.status(201).json({ success: true, data: newStorage });
  } catch (error) {
    console.error('Error adding storage location:', error);
    res.status(500).json({ success: false, message: 'Failed to add storage location' });
  }
});

// Update a storage location
router.put('/storage/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    
    // Check if storage location exists
    const existingStorage = getRowById('Storage', id);
    if (!existingStorage) {
      return res.status(404).json({ success: false, message: 'Storage location not found' });
    }
    
    // Update storage data
    const updatedData = {
      ...(name && { name }),
      ...(location !== undefined && { location }),
      updatedAt: new Date().toISOString()
    };
    
    // Update in Excel
    updateRow('Storage', id, updatedData);
    
    // Get updated storage location
    const updatedStorage = getRowById('Storage', id);
    
    res.json({ success: true, data: updatedStorage });
  } catch (error) {
    console.error('Error updating storage location:', error);
    res.status(500).json({ success: false, message: 'Failed to update storage location' });
  }
});

// Delete a storage location
router.delete('/storage/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if storage location exists
    const existingStorage = getRowById('Storage', id);
    if (!existingStorage) {
      return res.status(404).json({ success: false, message: 'Storage location not found' });
    }
    
    // Delete from Excel
    deleteRow('Storage', id);
    
    res.json({ success: true, message: 'Storage location deleted successfully' });
  } catch (error) {
    console.error('Error deleting storage location:', error);
    res.status(500).json({ success: false, message: 'Failed to delete storage location' });
  }
});

export default router;