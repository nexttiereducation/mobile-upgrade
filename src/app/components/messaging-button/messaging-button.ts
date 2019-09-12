import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from '@nte/services/message.service';

@Component({
  selector: `messaging-button`,
  templateUrl: `messaging-button.html`,
  styles: [`
    messaging-button button.button-native {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class MessagingButtonComponent {
  constructor(public messageService: MessageService,
    private router: Router) { }

  public goToMessaging() {
    // this.router.navigate([MessagingPage, null]);
    this.router.navigate(['app/messages']);
  }

}
