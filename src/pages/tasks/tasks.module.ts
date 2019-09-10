import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';
import { MaterialIconsModule } from 'ionic2-material-icons';

import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';
import { TasksPage } from './tasks';

@NgModule({
  declarations: [
    TasksPage
  ],
  exports: [
    TasksPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TasksPage),
    MaterialIconsModule,
    PipesModule
  ]
})

export class TasksPageModule { }
