import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChatModule } from '@nte/components/chat/chat.module';
import { ComponentsModule } from '@nte/components/components.module';
import { TaskAttachmentsPage } from '@nte/components/task-details/attachments/task-attachments';
import { TaskDetailPage } from '@nte/components/task-details/detail/task-detail';
import { TaskNotesPage } from '@nte/components/task-details/notes/task-notes';
import { PipesModule } from '@nte/pipes/pipes.module';

const components = [
  TaskDetailPage,
  TaskAttachmentsPage,
  TaskNotesPage
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ChatModule,
    PipesModule
  ],
  exports: components
})
export class TaskDetailsModule { }
