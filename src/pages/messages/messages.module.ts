import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MessagesPage } from './messages';
import { ChatModule } from '@nte/components/chat/chat.module';
import { ComponentsModule } from '@nte/components/components.module';

@NgModule({
  declarations: [
    MessagesPage
  ],
  exports: [
    MessagesPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    ChatModule
  ]
})
export class MessagesPageModule { }
