import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Archive, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { storageService, Storage } from '../services/storageService';

export default function StorageListPage() {
  const [storageLocations, setStorageLocations] = useState<Storage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStorage, setNewStorage] = useState({ name: '', location: '' });
  const [editingStorage, setEditingStorage] = useState<Storage | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch storage locations on mount
  useEffect(() => {
    fetchStorageLocations();
  }, []);

  // Fetch all storage locations
  const fetchStorageLocations = async () => {
    try {
      setLoading(true);
      const data = await storageService.getAllStorageLocations();
      setStorageLocations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching storage locations:', err);
      setError('Failed to load storage locations');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for new storage
  const handleNewStorageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStorage({
      ...newStorage,
      [name]: value
    });
  };

  // Add a new storage location
  const handleAddStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStorage.name.trim()) return;

    try {
      setSaving(true);
      const createdStorage = await storageService.createStorageLocation(
        newStorage.name.trim(),
        newStorage.location.trim()
      );
      
      if (createdStorage) {
        setStorageLocations([...storageLocations, createdStorage]);
        setNewStorage({ name: '', location: '' });
      } else {
        setError('Failed to create storage location');
      }
    } catch (err) {
      console.error('Error creating storage location:', err);
      setError('An error occurred while creating the storage location');
    } finally {
      setSaving(false);
    }
  };

  // Start editing a storage location
  const handleStartEdit = (storage: Storage) => {
    setEditingStorage({...storage});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingStorage(null);
  };

  // Handle input change for editing storage
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingStorage) return;
    
    const { name, value } = e.target;
    setEditingStorage({
      ...editingStorage,
      [name]: value
    });
  };

  // Save edited storage location
  const handleSaveEdit = async () => {
    if (!editingStorage || !editingStorage.name.trim()) return;

    try {
      setSaving(true);
      const updatedStorage = await storageService.updateStorageLocation(
        editingStorage.id,
        {
          name: editingStorage.name.trim(),
          location: editingStorage.location.trim()
        }
      );
      
      if (updatedStorage) {
        setStorageLocations(storageLocations.map(storage => 
          storage.id === updatedStorage.id ? updatedStorage : storage
        ));
        setEditingStorage(null);
      } else {
        setError('Failed to update storage location');
      }
    } catch (err) {
      console.error('Error updating storage location:', err);
      setError('An error occurred while updating the storage location');
    } finally {
      setSaving(false);
    }
  };

  // Delete a storage location
  const handleDeleteStorage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this storage location?')) {
      try {
        const success = await storageService.deleteStorageLocation(id);
        if (success) {
          setStorageLocations(storageLocations.filter(storage => storage.id !== id));
        } else {
          setError('Failed to delete storage location');
        }
      } catch (err) {
        console.error('Error deleting storage location:', err);
        setError('An error occurred while deleting the storage location');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Storage Locations</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Add New Storage Location Form */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Archive className="mr-2 h-5 w-5" />
          Add New Storage Location
        </h2>
        
        <form onSubmit={handleAddStorage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Warehouse A"
                value={newStorage.name}
                onChange={handleNewStorageChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Details/Address
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g., Building 3, Floor 2"
                value={newStorage.location}
                onChange={handleNewStorageChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !newStorage.name.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </form>
      </div>

      {/* Storage Locations List */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Storage Locations</h2>
        
        {loading ? (
          <div className="text-center p-4">Loading storage locations...</div>
        ) : storageLocations.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No storage locations found. Add your first location above.
          </div>
        ) : (
          <div className="space-y-4">
            {storageLocations.map(storage => (
              <div 
                key={storage.id} 
                className="p-4 border border-border rounded-md"
              >
                {editingStorage && editingStorage.id === storage.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                          name="name"
                          type="text"
                          value={editingStorage.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          autoFocus
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Details/Address</label>
                        <input
                          name="location"
                          type="text"
                          value={editingStorage.location}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit}
                        disabled={saving || !editingStorage.name.trim()}
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
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        <Archive className="mr-2 h-4 w-4" />
                        {storage.name}
                      </h3>
                      {storage.location && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {storage.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStartEdit(storage)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleDeleteStorage(storage.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}