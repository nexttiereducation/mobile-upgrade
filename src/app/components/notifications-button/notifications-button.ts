import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { NotificationService } from '@nte/services/notification.service';

@Component({
  selector: `notifications-button`,
  templateUrl: `notifications-button.html`
})
export class NotificationsButtonComponent {
  constructor(public notificationService: NotificationService,
    private router: Router) { }

  public goToNotifications() {
    this.router.navigate(['app/notifications']);
    // this.router.navigate([
    //   NotificationsPage,
    //   null,
    //   {
    //     animation: `ios-transition`,
    //     direction: `back`
    //   }
    // ]);
  }

}
