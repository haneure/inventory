import { Database, ExternalLink, File, FolderOpen, RotateCcw, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'

export default function SettingsPage() {
  const [currentDbPath, setCurrentDbPath] = useState<string | null>(null)
  const [appName, setAppName] = useState('Inventoria')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load current database path on component mount
  useEffect(() => {
    loadCurrentPath()
    loadAppSettings()
  }, [])

  const loadCurrentPath = async () => {
    try {
      if (window.api) {
        const path = await window.api.getDatabasePath()
        setCurrentDbPath(path)
      }
    } catch (error) {
      console.error('Error loading database path:', error)
    }
  }

  const loadAppSettings = async () => {
    try {
      if (window.api) {
        const settings = await window.api.getAppSettings()
        setAppName(settings.appName || 'Inventoria')
      }
    } catch (error) {
      console.error('Error loading app settings:', error)
    }
  }

  const handleSelectFolder = async () => {
    setIsLoading(true)
    try {
      if (window.api) {
        const selectedPath = await window.api.selectDatabaseFolder()
        if (selectedPath) {
          setCurrentDbPath(selectedPath)
          setMessage({ type: 'success', text: 'Database folder selected successfully! Reloading...' })
          // Refresh database and reload the window to apply the new database path
          await window.api.refreshDatabase()
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
      setMessage({ type: 'error', text: 'Failed to select folder' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectFile = async () => {
    setIsLoading(true)
    try {
      if (window.api) {
        const selectedPath = await window.api.selectDatabaseFile()
        if (selectedPath) {
          setCurrentDbPath(selectedPath)
          setMessage({ type: 'success', text: 'Database file selected successfully! Reloading...' })
          // Refresh database and reload the window to apply the new database path
          await window.api.refreshDatabase()
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error)
      setMessage({ type: 'error', text: 'Failed to select file' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPath = async () => {
    setIsLoading(true)
    try {
      if (window.api) {
        await window.api.resetDatabasePath()
        setCurrentDbPath(null)
        setMessage({ type: 'success', text: 'Database path reset to default! Reloading...' })
        // Refresh database and reload the window to apply the default database path
        await window.api.refreshDatabase()
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Error resetting path:', error)
      setMessage({ type: 'error', text: 'Failed to reset path' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenLocation = async () => {
    try {
      if (window.api) {
        await window.api.openDatabaseLocation()
      }
    } catch (error) {
      console.error('Error opening location:', error)
      setMessage({ type: 'error', text: 'Failed to open location' })
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (window.api) {
        const success = await window.api.saveAppSettings({ appName })
        if (success) {
          // Also update the window title immediately
          await window.api.updateWindowTitle(appName)
          setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } else {
          setMessage({ type: 'error', text: 'Failed to save settings' })
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
    return () => {} // Return cleanup function for all paths
  }, [message])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Database Settings */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Database Settings
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Database Location</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md border text-sm font-mono">
                {currentDbPath || 'Using default location (app data folder)'}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenLocation}
                className="flex items-center"
                title="Open location in file explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Database Location</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFolder}
                disabled={isLoading}
                className="flex items-center"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Select Folder
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFile}
                disabled={isLoading}
                className="flex items-center"
              >
                <File className="mr-2 h-4 w-4" />
                Select Existing File
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetPath}
                disabled={isLoading}
                className="flex items-center"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              <p>
                <strong>Select Folder:</strong> Creates or uses 'data.xlsx' in the selected folder
              </p>
              <p>
                <strong>Select File:</strong> Uses an existing Excel file as database
              </p>
              <p>
                <strong>Reset:</strong> Uses default app data folder
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Settings */}
      {/* <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Application Settings</h2>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="appName" className="text-sm font-medium">
              Application Name
            </label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Inventoria"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button type="submit" className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </form>
      </div> */}
    </div>
  )
}
