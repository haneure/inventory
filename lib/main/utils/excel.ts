import { app } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { getCurrentDatabasePath } from './config';

// Define the path to the Excel file
const getExcelFilePath = (): string => {
  const userDataPath = app.getPath('userData');
  const databaseDir = path.join(userDataPath, 'database');
  fs.ensureDirSync(databaseDir); // Ensure the directory exists
  return path.join(databaseDir, 'data.xlsx');
};

// Alternative path for development environment
const getDevExcelFilePath = (): string => {
  return path.join(process.cwd(), 'database', 'data.xlsx');
};

// Get the appropriate file path based on environment and user preference
const getDbFilePath = (): string => {
  // First check if user has set a custom path
  const customPath = getCurrentDatabasePath();
  if (customPath) {
    return customPath;
  }
  
  // Fallback to default behavior
  if (process.env.NODE_ENV === 'development') {
    const devPath = getDevExcelFilePath();
    if (fs.existsSync(devPath)) {
      return devPath;
    }
  }
  return getExcelFilePath();
};

// Initialize Excel file with sheets if it doesn't exist
export function initializeExcelFile(): void {
  const filePath = getDbFilePath();
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Initialize sheets with headers
    const productSheet = XLSX.utils.aoa_to_sheet([['id', 'name', 'category', 'price', 'stock', 'sku', 'qrCodePath', 'createdAt', 'updatedAt']]);
    const categorySheet = XLSX.utils.aoa_to_sheet([['id', 'name', 'createdAt', 'updatedAt']]);
    const storageSheet = XLSX.utils.aoa_to_sheet([['id', 'name', 'location', 'createdAt', 'updatedAt']]);
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Products');
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');
    XLSX.utils.book_append_sheet(workbook, storageSheet, 'Storage');
    
    // Write to file
    XLSX.writeFile(workbook, filePath);
  }
}

// Read data from a sheet
export function readSheet(sheetName: string): any[] {
  try {
    // Initialize if file doesn't exist
    initializeExcelFile();
    
    const filePath = getDbFilePath();
    const workbook = XLSX.readFile(filePath);
    
    // Check if the sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`Sheet '${sheetName}' does not exist`);
      return [];
    }
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    console.error(`Error reading ${sheetName} sheet:`, error);
    return [];
  }
}

// Write data to a sheet (replaces the entire sheet)
export function writeSheet(sheetName: string, data: any[]): void {
  try {
    // Initialize if file doesn't exist
    initializeExcelFile();
    
    const filePath = getDbFilePath();
    let workbook: XLSX.WorkBook;
    
    // Read existing workbook if it exists
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
    } else {
      workbook = XLSX.utils.book_new();
    }
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // If sheet exists, replace it, otherwise append it
    if (workbook.SheetNames.includes(sheetName)) {
      workbook.Sheets[sheetName] = worksheet;
    } else {
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    
    // Write to file
    XLSX.writeFile(workbook, filePath);
  } catch (error) {
    console.error(`Error writing to ${sheetName} sheet:`, error);
  }
}

// Append a row to a sheet
export function appendToSheet(sheetName: string, row: any): void {
  try {
    // Get existing data
    const data = readSheet(sheetName);
    
    // Add new row
    data.push(row);
    
    // Write back to sheet
    writeSheet(sheetName, data);
  } catch (error) {
    console.error(`Error appending to ${sheetName} sheet:`, error);
  }
}

// Update a row in a sheet by ID
export function updateRow(sheetName: string, id: string, newData: any): void {
  try {
    // Get existing data
    const data = readSheet(sheetName);
    
    // Find index of the row with matching ID
    const index = data.findIndex((row: any) => row.id === id);
    
    if (index !== -1) {
      // Update the row
      data[index] = { ...data[index], ...newData, updatedAt: new Date().toISOString() };
      
      // Write back to sheet
      writeSheet(sheetName, data);
    } else {
      console.error(`Row with ID ${id} not found in ${sheetName}`);
    }
  } catch (error) {
    console.error(`Error updating row in ${sheetName} sheet:`, error);
  }
}

// Delete a row from a sheet by ID
export function deleteRow(sheetName: string, id: string): void {
  try {
    // Get existing data
    const data = readSheet(sheetName);
    
    // Filter out the row with matching ID
    const filteredData = data.filter((row: any) => row.id !== id);
    
    // Check if any row was removed
    if (filteredData.length < data.length) {
      // Write back to sheet
      writeSheet(sheetName, filteredData);
    } else {
      console.error(`Row with ID ${id} not found in ${sheetName}`);
    }
  } catch (error) {
    console.error(`Error deleting row from ${sheetName} sheet:`, error);
  }
}

// Get a single row by ID
export function getRowById(sheetName: string, id: string): any | null {
  try {
    // Get all data
    const data = readSheet(sheetName);
    
    // Find row with matching ID
    const row = data.find((row: any) => row.id === id);
    
    return row || null;
  } catch (error) {
    console.error(`Error getting row by ID from ${sheetName} sheet:`, error);
    return null;
  }
}