import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { SurveyCcComponent } from '@nte/components/survey/survey-cc';
import { SurveyCustomComponent } from '@nte/components/survey/survey-custom';
import { SurveyIpComponent } from '@nte/components/survey/survey-ip';
import { SurveyPhspComponent } from '@nte/components/survey/survey-phsp';
import { SurveyPhspCollegesComponent } from '@nte/components/survey/survey-phsp-colleges';
import { SurveyPhspResultsComponent } from '@nte/components/survey/survey-phsp-results';
import { SurveyPhspScholarshipsComponent } from '@nte/components/survey/survey-phsp-scholarships';
import { SurveyPhspTableComponent } from '@nte/components/survey/survey-phsp-table';
import { PipesModule } from '@nte/pipes/pipes.module';
import { SurveyIpService } from '@nte/services/survey-ip.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskSurveyPage } from './task-survey';

import { SurveyPhspResultsCollegeComponent } from '@nte/components/survey/survey-phsp-results-college';

// tslint:disable-next-line:import-spacing
const components = [
  TaskSurveyPage,
  SurveyCcComponent,
  SurveyCustomComponent,
  SurveyIpComponent,
  SurveyPhspCollegesComponent,
  SurveyPhspComponent,
  SurveyPhspResultsCollegeComponent,
  SurveyPhspResultsComponent,
  SurveyPhspScholarshipsComponent,
  SurveyPhspTableComponent
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TaskSurveyPage),
    PipesModule
  ],
  services: [
    SurveyService,
    SurveyIpService
  ]
})

export class TaskSurveyPageModule { }
