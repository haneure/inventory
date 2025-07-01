import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from '../store/api/apiSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Category } from '../services/categoryService';

export default function CategoryPage() {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // RTK Query hooks
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery();
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Add a new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setSaving(true);
      await addCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
    } catch (err) {
      console.error('Error creating category:', err);
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

  // Handle input change for editing category
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCategory) return;
    
    setEditingCategory({
      ...editingCategory,
      name: e.target.value
    });
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setSaving(true);
      await updateCategory({
        id: editingCategory.id,
        name: editingCategory.name.trim()
      });
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (err) {
        console.error('Error deleting category:', err);
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
          {error.toString()}
        </div>
      )}

      {/* Add New Category Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Tag className="mr-2 h-5 w-5" />
          Add New Category
        </h2>
        
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            placeholder="Category name..."
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

      {/* Categories List using shadcn/ui Table */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Categories List</h2>
        
        {isLoading ? (
          <div className="text-center p-4">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No categories found. Add your first category above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  {editingCategory && editingCategory.id === category.id ? (
                    <TableCell colSpan={2}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingCategory.name}
                          onChange={handleEditChange}
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
                    </TableCell>
                  ) : (
                    <>
                      <TableCell>
                        <div className="font-medium flex items-center">
                          <Tag className="mr-2 h-4 w-4" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleStartEdit(category)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}