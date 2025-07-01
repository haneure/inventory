import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { categoryService, Category } from '../services/categoryService';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setSaving(true);
      const newCategory = await categoryService.createCategory(newCategoryName.trim());
      if (newCategory) {
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
      } else {
        setError('Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('An error occurred while creating the category');
    } finally {
      setSaving(false);
    }
  };

  // Start editing a category
  const handleStartEdit = (category: Category) => {
    setEditingCategory({...category});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setSaving(true);
      const updatedCategory = await categoryService.updateCategory(
        editingCategory.id, 
        editingCategory.name.trim()
      );
      
      if (updatedCategory) {
        setCategories(categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
      } else {
        setError('Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('An error occurred while updating the category');
    } finally {
      setSaving(false);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const success = await categoryService.deleteCategory(id);
        if (success) {
          setCategories(categories.filter(cat => cat.id !== id));
        } else {
          setError('Failed to delete category');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('An error occurred while deleting the category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Add New Category Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Tag className="mr-2 h-5 w-5" />
          Add New Category
        </h2>
        
        <form onSubmit={handleAddCategory} className="flex space-x-2">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <Button type="submit" disabled={saving || !newCategoryName.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Categories List</h2>
        
        {loading ? (
          <div className="text-center p-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No categories found. Add your first category above.
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="flex items-center justify-between p-3 border border-border rounded-md"
              >
                {editingCategory && editingCategory.id === category.id ? (
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSaveEdit}
                      disabled={saving || !editingCategory.name.trim()}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{category.name}</span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStartEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}