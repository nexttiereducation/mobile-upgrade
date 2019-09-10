import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { MessagingPage } from './messaging';

@NgModule({
  declarations: [
    MessagingPage
  ],
  exports: [
    MessagingPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(MessagingPage)
  ]
})
export class MessagingPageModule { }
