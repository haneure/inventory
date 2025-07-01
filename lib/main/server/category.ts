import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readSheet, appendToSheet, updateRow, deleteRow, getRowById } from '../utils/excel';

const router = express.Router();

// Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = readSheet('Categories');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get a single category by ID
router.get('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const category = getRowById('Categories', id);
    
    if (category) {
      res.json({ success: true, data: category });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

// Add a new category
router.post('/categories', (req, res) => {
  try {
    const { name } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    
    // Create new category
    const newCategory = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to Excel
    appendToSheet('Categories', newCategory);
    
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ success: false, message: 'Failed to add category' });
  }
});

// Update a category
router.put('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if category exists
    const existingCategory = getRowById('Categories', id);
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Update category data
    const updatedData = {
      ...(name && { name }),
      updatedAt: new Date().toISOString()
    };
    
    // Update in Excel
    updateRow('Categories', id, updatedData);
    
    // Get updated category
    const updatedCategory = getRowById('Categories', id);
    
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = getRowById('Categories', id);
    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Delete from Excel
    deleteRow('Categories', id);
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

export default router;