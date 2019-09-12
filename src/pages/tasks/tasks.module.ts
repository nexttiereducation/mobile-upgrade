import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TasksPage } from './tasks';
import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';

@NgModule({
  declarations: [
    TasksPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    // RouterModule.forChild(TasksPage),
    PipesModule
  ]
})

export class TasksPageModule { }
