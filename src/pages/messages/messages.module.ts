import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { MessagesPage } from './messages';

@NgModule({
  declarations: [
    MessagesPage
  ],
  exports: [
    MessagesPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(MessagesPage)
  ]
})
export class MessagesPageModule { }
