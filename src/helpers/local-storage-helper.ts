import {Injectable} from "@angular/core";

@Injectable()
export class LocalStorageHelper {

  public static saveToLocalStorage(key: string, item: any) {
    localStorage.setItem(key, item);
  }

  public static hasKey(key: string): boolean {
    return !!localStorage.getItem(key);

  }

  public static getFromLocalStorage(key: string) {
    return localStorage.getItem(key);
  }

  public static removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  public static clearLocalStorage() {
    localStorage.clear()
  }
}
