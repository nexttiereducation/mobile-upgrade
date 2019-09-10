import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PushNotificationService } from '@nte/services/push-notification.service';
import { TabsPage } from './tabs';

@NgModule({
  declarations: [
    TabsPage
  ],
  exports: [
    TabsPage
  ],
  imports: [
    IonicPageModule.forChild(TabsPage)
  ],
  services: [
    PushNotificationService
  ]
})

export class TabsPageModule { }
