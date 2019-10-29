import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Toast } = Plugins;

@Injectable()
export class ToastService {
  constructor() { }

  public async open(msg: string, dur: number = 3000, pos: any = `bottom`) {
    const toast = await Toast.show({
      duration: dur <= 3000 ? 'short' : 'long',
      text: msg
    });
  }
}
