import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TaskPage } from './../task/task';
import { TasksListPage } from './tasks-list';
import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: 'app/tasks/list/:id',
    component: TasksListPage
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
