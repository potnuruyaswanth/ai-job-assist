import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): Record<string, T> {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeCollection<T>(collection: string, data: Record<string, T>): void {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const db = {
  get: <T>(collection: string, key: string): T | null => {
    const data = readCollection<T>(collection);
    return data[key] || null;
  },

  set: <T>(collection: string, key: string, value: T): void => {
    const data = readCollection<T>(collection);
    data[key] = value;
    writeCollection(collection, data);
  },

  delete: (collection: string, key: string): boolean => {
    const data = readCollection(collection);
    if (data[key]) {
      delete data[key];
      writeCollection(collection, data);
      return true;
    }
    return false;
  },

  getAll: <T>(collection: string): T[] => {
    const data = readCollection<T>(collection);
    return Object.values(data);
  },

  find: <T>(collection: string, predicate: (item: T) => boolean): T | null => {
    const items = readCollection<T>(collection);
    for (const item of Object.values(items)) {
      if (predicate(item)) {
        return item;
      }
    }
    return null;
  },

  filter: <T>(collection: string, predicate: (item: T) => boolean): T[] => {
    const items = readCollection<T>(collection);
    return Object.values(items).filter(predicate);
  }
};
