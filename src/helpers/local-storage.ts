import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';

@Injectable()
export class LocalStorageHelper {
  private static _storage: Storage;
  private static _memoryCache: Map<string, any> = new Map();
  private static _initialized = false;

  constructor(private storage: Storage, private platform: Platform) {
    // Initialize the static storage reference
    LocalStorageHelper._storage = storage;

    // Initialize the cache from localStorage (for backward compatibility)
    this.initializeCache();
  }

  private initializeCache() {
    // Initialize from localStorage first (for instant access)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = localStorage.getItem(key);
        LocalStorageHelper._memoryCache.set(key, value);
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }

    // Then load from Ionic Storage which is more persistent but async
    this.platform.ready().then(() => {
      this.storage.ready().then(() => {
        // Get all keys and values from Ionic Storage
        this.storage.forEach((value, key) => {
          LocalStorageHelper._memoryCache.set(key, value);
          // Also update localStorage for backward compatibility
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            console.warn('Error setting localStorage value:', e);
          }
        }).then(() => {
          LocalStorageHelper._initialized = true;
          console.log('Storage cache initialized');
        });
      });
    });
  }

  public static saveToLocalStorage(key: string, item: any): void {
    // Update in-memory cache immediately
    this._memoryCache.set(key, item);

    // Update localStorage for backward compatibility
    try {
      localStorage.setItem(key, item);
    } catch (e) {
      console.warn('Error setting localStorage value:', e);
    }

    // Update in Ionic Storage asynchronously
    if (this._storage) {
      this._storage.set(key, item).catch(e => {
        console.error('Error saving to Ionic Storage:', e);
      });
    }
  }

  public static hasKey(key: string): boolean {
    // Check in-memory cache first for performance
    if (this._memoryCache.has(key)) {
      return true;
    }

    // Fall back to localStorage for backward compatibility
    return !!localStorage.getItem(key);
  }

  public static getFromLocalStorage(key: string): string {
    // Check in-memory cache first
    if (this._memoryCache.has(key)) {
      return this._memoryCache.get(key);
    }

    // Fall back to localStorage
    const value = localStorage.getItem(key);

    // If we find it in localStorage but not in our cache, update the cache
    if (value !== null) {
      this._memoryCache.set(key, value);
    }

    return value;
  }

  public static removeFromLocalStorage(key: string): void {
    // Remove from in-memory cache
    this._memoryCache.delete(key);

    // Remove from localStorage
    localStorage.removeItem(key);

    // Remove from Ionic Storage asynchronously
    if (this._storage) {
      this._storage.remove(key).catch(e => {
        console.error('Error removing from Ionic Storage:', e);
      });
    }
  }

  public static clearLocalStorage(): void {
    // Clear in-memory cache
    this._memoryCache.clear();

    // Clear localStorage
    localStorage.clear();

    // Clear Ionic Storage asynchronously
    if (this._storage) {
      this._storage.clear().catch(e => {
        console.error('Error clearing Ionic Storage:', e);
      });
    }
  }
}
