
import { Task, User } from '../types';

interface FileHandle {
  fileHandle?: FileSystemFileHandle;
  writable?: FileSystemWritableStream;
}

// Store file handles per user
const fileHandles: Record<string, FileHandle> = {};

/**
 * Request file access using File System Access API (modern browsers)
 * Returns true if successful, false if not supported
 */
export async function requestFileAccess(username: string): Promise<boolean> {
  try {
    // Check if File System Access API is supported
    if (!('showSaveFilePicker' in window)) {
      return false;
    }

    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `angel-planner-${username}-tasks.json`,
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    fileHandles[username] = { fileHandle };
    return true;
  } catch (error: any) {
    // User cancelled or API not supported
    if (error.name !== 'AbortError') {
      console.error('Error requesting file access:', error);
    }
    return false;
  }
}

/**
 * Save tasks to file using File System Access API
 */
export async function saveTasksToFile(username: string, tasks: Task[]): Promise<boolean> {
  try {
    const handle = fileHandles[username];
    
    // If we have a file handle, use it
    if (handle?.fileHandle) {
      const writable = await (handle.fileHandle as any).createWritable();
      await writable.write(JSON.stringify(tasks, null, 2));
      await writable.close();
      return true;
    }

    // Otherwise, try to request access
    const hasAccess = await requestFileAccess(username);
    if (hasAccess && fileHandles[username]?.fileHandle) {
      return await saveTasksToFile(username, tasks);
    }

    return false;
  } catch (error) {
    console.error('Error saving tasks to file:', error);
    return false;
  }
}

/**
 * Load tasks from file using File System Access API
 */
export async function loadTasksFromFile(username: string): Promise<Task[] | null> {
  try {
    // Check if File System Access API is supported
    if (!('showOpenFilePicker' in window)) {
      return null;
    }

    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    const tasks = JSON.parse(text) as Task[];

    // Store the file handle for future saves
    fileHandles[username] = { fileHandle };

    return tasks;
  } catch (error: any) {
    // User cancelled
    if (error.name === 'AbortError') {
      return null;
    }
    console.error('Error loading tasks from file:', error);
    return null;
  }
}

/**
 * Export tasks as downloadable JSON file (fallback method)
 */
export function exportTasksToFile(tasks: Task[], username: string): void {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `angel-planner-${username}-tasks-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import tasks from uploaded JSON file (fallback method)
 */
export function importTasksFromFile(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const tasks = JSON.parse(text) as Task[];
        resolve(tasks);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}
