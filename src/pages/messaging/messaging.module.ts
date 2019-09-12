import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { MessagingPage } from './messaging';
import { ComponentsModule } from '@nte/components/components.module';
import { MessagesPage } from '@nte/pages/messages/messages';

const routes: Routes = [
  {
    path: 'app/messages',
    component: MessagingPage,
    children: [
      {
        path: ':id',
        component: MessagesPage
      }
    ]
  }
];

@NgModule({
  declarations: [
    MessagingPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
  ]
})
export class MessagingPageModule { }
