import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MessagesPage } from './messages';
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
    ComponentsModule
  ]
})
export class MessagesPageModule { }
