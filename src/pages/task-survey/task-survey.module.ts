import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TaskSurveyPage } from './task-survey';
import { ComponentsModule } from '@nte/components/components.module';
import { SurveyModule } from '@nte/components/survey/survey.module';
import { PipesModule } from '@nte/pipes/pipes.module';
import { SurveyIpService } from '@nte/services/survey-ip.service';
import { SurveyService } from '@nte/services/survey.service';

const routes: Routes = [
  {
    path: 'app/tasks/:id/survey',
    component: TaskSurveyPage
  }
];

@NgModule({
  declarations: [
    TaskSurveyPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    PipesModule,
    SurveyModule
  ],
  providers: [
    SurveyService,
    SurveyIpService
  ]
})
export class TaskSurveyPageModule { }
