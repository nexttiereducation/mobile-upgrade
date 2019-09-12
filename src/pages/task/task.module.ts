import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TaskPage } from './task';
import { ComponentsModule } from '@nte/components/components.module';
import { PromptComponent } from '@nte/components/prompt/prompt';
import { PromptModule } from '@nte/components/prompt/prompt.module';
import { MessagesPage } from '@nte/pages/messages/messages';
import { PipesModule } from '@nte/pipes/pipes.module';

const routes: Routes = [
  {
    path: 'app/tasks/:id',
    children: [
      {
        path: '',
        component: TaskPage
      },
      {
        path: 'attachments',
        loadChildren: '@nte/pages/task-attachments/task-attachments.module#TaskAttachmentsPageModule',
        // component: TaskAttachmentsPage
      },
      {
        path: 'notes',
        component: MessagesPage
      },
      // {
      //   path: 'prompt',
      //   loadChildren: '@nte/pages/task-prompt/task-prompt.module#TaskPromptPageModule',
      //   // component: PromptComponent
      // },
      {
        path: 'survey',
        loadChildren: '@nte/pages/task-survey/task-survey.module#TaskSurveyPageModule',
        // component: TaskSurveyPage
      },
    ]
  }
];

@NgModule({
  declarations: [
    TaskPage
  ],
  entryComponents: [
    PromptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    PipesModule,
    PromptModule
  ]
})
export class TaskPageModule { }
