import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable()
export class ToastService {
  constructor(private toastCtrl: ToastController) { }

  public async open(msg: string, dur: number = 3000, pos: any = `bottom`) {
    const toast = await this.toastCtrl.create({
      duration: dur,
      message: msg,
      position: pos
    });
    toast.present();
  }
}
