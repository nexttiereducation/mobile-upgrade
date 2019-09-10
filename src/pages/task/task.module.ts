import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { PromptComponent } from '@nte/components/prompt/prompt';
import { PromptScholarshipComponent } from '@nte/components/prompt/prompt-scholarship';
import { PromptSelectComponent } from '@nte/components/prompt/prompt-select';
import { PromptTestDatesComponent } from '@nte/components/prompt/prompt-test-dates';
import { PipesModule } from '@nte/pipes/pipes.module';
import { TaskPage } from './task';

const components = [
  PromptComponent,
  PromptScholarshipComponent,
  PromptSelectComponent,
  PromptTestDatesComponent,
  TaskPage
];

@NgModule({
  declarations: components,
  entryComponents: [
    PromptComponent
  ],
  exports: components,
  imports: [
    ComponentsModule,
    PipesModule,
    IonicPageModule.forChild(TaskPage)
  ]
})
export class TaskPageModule { }
