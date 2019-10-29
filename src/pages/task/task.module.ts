import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TaskPage } from './task';
import { ChatModule } from '@nte/components/chat/chat.module';
import { ComponentsModule } from '@nte/components/components.module';
import { PromptComponent } from '@nte/components/prompt/prompt';
import { PromptModule } from '@nte/components/prompt/prompt.module';
import { SurveyModule } from '@nte/components/survey/survey.module';
import { TaskDetailsModule } from '@nte/components/task-details/task-details.module';
import { PipesModule } from '@nte/pipes/pipes.module';

// const routes: Routes = [
//   {
//     path: 'app/tasks/:id',
//     component: TaskPage,
//     children: [
//       {
//         path: '',
//         component: TaskDetailPage
//       },
//       {
//         path: 'attachments',
//         // loadChildren: '@nte/pages/task-attachments/task-attachments.module#TaskAttachmentsPageModule',
//         component: TaskAttachmentsPage
//       },
//       {
//         path: 'notes',
//         component: MessagesPage
//       },
//       // {
//       //   path: 'prompt',
//       //   loadChildren: '@nte/pages/task-prompt/task-prompt.module#TaskPromptPageModule',
//       //   // component: PromptComponent
//       // },
//       {
//         path: 'survey',
//         // loadChildren: '@nte/pages/task-survey/task-survey.module#TaskSurveyPageModule',
//         component: TaskSurveyPage
//       },
//     ]
//   }
// ];

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
    // RouterModule.forChild(routes),
    ComponentsModule,
    PipesModule,
    TaskDetailsModule,
    PromptModule,
    SurveyModule,
    ChatModule
  ]
})
export class TaskPageModule { }
