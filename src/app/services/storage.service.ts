import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable()
export class StorageService {
  constructor() { }
  // JSON "set" example
  async setObject(key: string, val: any) {
    await Storage.set({
      key,
      value: JSON.stringify(val)
    });
  }

  // JSON "get" example
  async getObject(key: string) {
    const ret = await Storage.get({ key });
    return JSON.parse(ret.value);
  }

  async setItem(key: string, value: string) {
    await Storage.set({
      key,
      value
    });
  }

  async getItem(key: string) {
    const value = await Storage.get({ key });
    console.log('Got item: ', value);
    return value;
  }

  async removeItem(key: string) {
    await Storage.remove({ key });
  }

  async keys() {
    const keys = await Storage.keys();
    console.log('Got keys: ', keys);
    return keys;
  }

  async clear() {
    await Storage.clear();
  }
}
