import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageHelper {


  public static saveToLocalStorage(key: string, item: any): void {
    localStorage.setItem(key, item);
  }

  public static hasKey(key: string): boolean {
    return !!localStorage.getItem(key);

  }

  public static getFromLocalStorage(key: string): string {
    return localStorage.getItem(key);
  }

  public static removeFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  public static clearLocalStorage(): void {
    localStorage.clear();
  }
}
