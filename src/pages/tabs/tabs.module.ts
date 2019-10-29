import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs';
import { AuthGuard } from '@nte/app/guards/auth.guard';
import { ComponentsModule } from '@nte/components/components.module';
import { TaskAttachmentsPage } from '@nte/components/task-details/attachments/task-attachments';
import { TaskSurveyPage } from '@nte/components/task-details/survey/task-survey';
import { CollegePage } from '@nte/pages/college/college';
import { CollegesListPage } from '@nte/pages/colleges-list/colleges-list';
import { CollegesPage } from '@nte/pages/colleges/colleges';
import { FilterCategoryPage } from '@nte/pages/filter-category/filter-category';
import { FilterPage } from '@nte/pages/filter/filter';
import { ListTileCreatePage } from '@nte/pages/list-tile-create/list-tile-create';
import { MessagesPage } from '@nte/pages/messages/messages';
import { ProfilePage } from '@nte/pages/profile/profile';
import { ScholarshipPage } from '@nte/pages/scholarship/scholarship';
import { ScholarshipsListPage } from '@nte/pages/scholarships-list/scholarships-list';
import { ScholarshipsPage } from '@nte/pages/scholarships/scholarships';
import { TaskPage } from '@nte/pages/task/task';
import { TasksListPage } from '@nte/pages/tasks-list/tasks-list';
import { TasksPage } from '@nte/pages/tasks/tasks';

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    component: TabsPage,
    path: 'app',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks'
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            component: TasksPage
          },
          {
            path: 'list',
            component: TasksPage,
            // loadChildren: '@nte/pages/tasks-list/tasks-list.module#TasksListPageModule'
            children: [{
              path: ':id',
              component: TasksListPage,
              // loadChildren: '@nte/pages/tasks-list/tasks-list.module#TasksListPageModule'
              children: [
                // {
                //   path: `edit`,
                //   component: ListTileCreatePage
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
                  // loadChildren: '@nte/pages/task/task.module#TaskPageModule'
                },
                // {
                //   path: 'filter',
                //   component: FilterPage,
                //   children: [{
                //     path: ':category',
                //     component: FilterCategoryPage
                //   }]
                // }
              ]
            }]
          }
        ]
      },
      {
        path: 'colleges',
        children: [
          {
            path: '',
            component: CollegesPage
          },
          {
            path: 'list',
            component: CollegesPage,
            children: [{
              path: ':id',
              component: CollegesListPage,
              // loadChildren: '@nte/pages/colleges-list/colleges-list.module#CollegesListPageModule'
              children: [
                {
                  path: `edit`,
                  component: ListTileCreatePage
                },
                {
                  path: 'college/:id',
                  component: CollegePage
                },
                {
                  path: 'filter',
                  component: FilterPage,
                  children: [{
                    path: ':category',
                    component: FilterCategoryPage
                  }]
                }
              ]
            }]
          }
        ]
      },
      {
        path: 'scholarships',
        children: [
          {
            path: '',
            component: ScholarshipsPage
          },
          {
            path: 'list',
            component: ScholarshipsPage,
            children: [
              // {
              //   path: 'create',
              //   component: ListTileCreatePage
              // },
              {
                path: ':id',
                component: ScholarshipsListPage,
                // loadChildren: '@nte/pages/scholarships-list/scholarships-list.module#ScholarshipsListPageModule'
                children: [
                  // {
                  //   path: `edit`,
                  //   component: ListTileCreatePage
                  // },
                  {
                    path: 'scholarship/:id',
                    component: ScholarshipPage
                    // loadChildren: '@nte/pages/scholarship/scholarship.module#ScholarshipPageModule'
                  },
                  {
                    path: 'filter',
                    component: FilterPage,
                    children: [{
                      path: ':category',
                      component: FilterCategoryPage
                    }]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'profile',
        component: ProfilePage
      }
    ]
  }
];

@NgModule({
  declarations: [
    TabsPage
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forRoot(routes),
    ComponentsModule
  ]
})

export class TabsPageModule { }
