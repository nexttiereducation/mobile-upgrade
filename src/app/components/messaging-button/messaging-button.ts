import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { MessagingPage } from './../../pages/messaging/messaging';
import { MessageProvider } from '@nte/services/message.service';

@Component({
  selector: `[messaging-button]`,
  templateUrl: `messaging-button.html`
})
export class MessagingButtonComponent {
  constructor(public messageProvider: MessageProvider,
    private navCtrl: NavController) { }

  public goToMessaging() {
    this.navCtrl.push(MessagingPage, null, { animation: `ios-transition` });
  }

}
