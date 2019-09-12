import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { NotificationsPage } from './notifications';
import { ComponentsModule } from '@nte/components/components.module';
import { CollegePageModule } from '@nte/pages/college/college.module';
import { CollegesListPageModule } from '@nte/pages/colleges-list/colleges-list.module';
import { CollegesPageModule } from '@nte/pages/colleges/colleges.module';
import { MessagingPageModule } from '@nte/pages/messaging/messaging.module';
import { TaskPageModule } from '@nte/pages/task/task.module';
import { TasksListPageModule } from '@nte/pages/tasks-list/tasks-list.module';
import { TasksPageModule } from '@nte/pages/tasks/tasks.module';
import { NotificationService } from '@nte/services/notification.service';

const routes: Routes = [
  {
    path: 'app/notifications',
    component: NotificationsPage
  }
];

@NgModule({
  declarations: [
    NotificationsPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    TasksPageModule,
    TasksListPageModule,
    TaskPageModule,
    CollegesPageModule,
    CollegesListPageModule,
    CollegePageModule,
    MessagingPageModule
  ],
  providers: [
    NotificationService
  ]
})
export class NotificationsPageModule { }
