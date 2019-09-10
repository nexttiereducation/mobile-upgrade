import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { NotificationService } from '@nte/services/notification.service';
import { CollegePageModule } from './../college/college.module';
import { CollegesListPageModule } from './../colleges-list/colleges-list.module';
import { CollegesPageModule } from './../colleges/colleges.module';
import { MessagingPageModule } from './../messaging/messaging.module';
import { TaskPageModule } from './../task/task.module';
import { TasksListPageModule } from './../tasks-list/tasks-list.module';
import { TasksPageModule } from './../tasks/tasks.module';
import { NotificationsPage } from './notifications';

@NgModule({
  declarations: [
    NotificationsPage
  ],
  exports: [
    NotificationsPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(NotificationsPage),
    TasksPageModule,
    TasksListPageModule,
    TaskPageModule,
    CollegesPageModule,
    CollegesListPageModule,
    CollegePageModule,
    MessagingPageModule
  ],
  services: [
    NotificationService
  ]
})
export class NotificationsPageModule { }
