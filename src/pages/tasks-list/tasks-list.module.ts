import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ApplicationDatesComponent } from '@nte/components/application-dates/application-dates';
import { ComponentsModule } from '@nte/components/components.module';
import { TaskPage } from './../task/task';
import { TasksListPage } from './tasks-list';

@NgModule({
  declarations: [
    TasksListPage
  ],
  entryComponents: [
    ApplicationDatesComponent,
    TaskPage
  ],
  exports: [
    TasksListPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TasksListPage)
  ]
})

export class TasksListPageModule {}
