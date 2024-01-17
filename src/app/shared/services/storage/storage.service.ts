import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  localStorage: Storage;
  constructor() {
    this.localStorage = window.localStorage;
  }

  getItem(key: string) {
    return this.localStorage.getItem(key);
  }

  setItem(key: string, value: string) {
    return this.localStorage.setItem(key, value);
  }

  removeItem(key: string) {
    return this.localStorage.removeItem(key);
  }
}
