import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { ComponentsModule } from '@nte/components/components.module';
import { TaskAttachmentsPage } from '@nte/components/task-details/attachments/task-attachments';
import { TaskSurveyPage } from '@nte/components/task-details/survey/task-survey';
import { MessagesPage } from '@nte/pages/messages/messages';
import { TaskPage } from '@nte/pages/task/task';
import { TasksListPage } from '@nte/pages/tasks-list/tasks-list';

const routes: Routes = [
  {
    path: 'app/tasks/list/:id',
    children: [
      {
        path: '',
        component: TasksListPage
      },
      // {
      //   path: 'filter',
      //   component: FilterPage,
      //   children: [
      //     {
      //       path: ':category',
      //       component: FilterCategoryPage
      //     }
      //   ]
      // },
      {
        path: 'task/:id',
        component: TaskPage,
        children: [
          {
            path: 'attachments',
            component: TaskAttachmentsPage
          },
          {
            path: 'notes',
            component: MessagesPage
          },
          {
            path: 'survey',
            component: TaskSurveyPage
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    TasksListPage
  ],
  entryComponents: [
    ApplicationDatesComponent,
    TaskPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class TasksListPageModule { }
