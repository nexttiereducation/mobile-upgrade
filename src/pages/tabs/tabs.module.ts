import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs';
import { ComponentsModule } from '@nte/components/components.module';
import { CollegesPage } from '@nte/pages/colleges/colleges';
import { ProfilePage } from '@nte/pages/profile/profile';
import { ScholarshipsPage } from '@nte/pages/scholarships/scholarships';
import { TasksPage } from '@nte/pages/tasks/tasks';

const routes: Routes = [
  {
    // canActivate: [AuthGuard],
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
              loadChildren: '@nte/pages/tasks-list/tasks-list.module#TasksListPageModule'
            }]
          },
          {
            path: ':id',
            loadChildren: '@nte/pages/task/task.module#TaskPageModule'
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
              loadChildren: '@nte/pages/colleges-list/colleges-list.module#CollegesListPageModule'
            }]
          },
          {
            path: ':id',
            loadChildren: '@nte/pages/college/college.module#CollegePageModule'
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
            children: [{
              path: ':id',
              loadChildren: '@nte/pages/scholarships-list/scholarships-list.module#ScholarshipsListPageModule'
            }]
          },
          {
            path: ':id',
            loadChildren: '@nte/pages/scholarship/scholarship.module#ScholarshipPageModule'
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
