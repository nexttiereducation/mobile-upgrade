import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { NotificationsPage } from './../../pages/notifications/notifications';
import { NotificationProvider } from '@nte/services/notification.service';

@Component({
  selector: `[notifications-button]`,
  templateUrl: `notifications-button.html`
})
export class NotificationsButtonComponent {
  constructor(public notificationProvider: NotificationProvider,
    private navCtrl: NavController) { }

  public goToNotifications() {
    this.navCtrl.push(
      NotificationsPage,
      null,
      {
        animation: `ios-transition`,
        direction: `back`
      }
    );
  }

}
