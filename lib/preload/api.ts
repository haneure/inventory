import { ipcRenderer } from 'electron'

const api = {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  // Database path management
  getDatabasePath: () => {
    return ipcRenderer.invoke('get-database-path')
  },
  selectDatabaseFolder: () => {
    return ipcRenderer.invoke('select-database-folder')
  },
  selectDatabaseFile: () => {
    return ipcRenderer.invoke('select-database-file')
  },
  resetDatabasePath: () => {
    return ipcRenderer.invoke('reset-database-path')
  },
  refreshDatabase: () => {
    return ipcRenderer.invoke('refresh-database')
  },
  openDatabaseLocation: () => {
    return ipcRenderer.invoke('open-database-location')
  },
  saveAppSettings: (settings: any) => {
    return ipcRenderer.invoke('save-app-settings', settings)
  },
  getAppSettings: () => {
    return ipcRenderer.invoke('get-app-settings')
  },
  updateWindowTitle: (title: string) => {
    return ipcRenderer.invoke('update-window-title', title)
  }
}

export default api
