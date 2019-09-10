import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { TaskAttachmentsPage } from './task-attachments';

@NgModule({
  declarations: [
    TaskAttachmentsPage
  ],
  exports: [
    TaskAttachmentsPage
  ],
  imports: [
    IonicPageModule.forChild(TaskAttachmentsPage),
    ComponentsModule
  ]
})

export class TaskAttachmentsPageModule {}
