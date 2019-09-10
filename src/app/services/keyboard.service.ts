import { Injectable } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard';

@Injectable({ providedIn: 'root' })
export class KeyboardService {
  constructor(public keyboard: Keyboard) { }

  public close() {
    if (this.keyboard) {
      this.keyboard.hide();
    }
  }
}
