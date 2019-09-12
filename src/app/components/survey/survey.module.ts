import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { SurveyCcComponent } from '@nte/components/survey/survey-cc';
import { SurveyCustomComponent } from '@nte/components/survey/survey-custom';
import { SurveyIpComponent } from '@nte/components/survey/survey-ip';
import { SurveyPhspComponent } from '@nte/components/survey/survey-phsp';
import { SurveyPhspCollegesComponent } from '@nte/components/survey/survey-phsp-colleges';
import { SurveyPhspResultsComponent } from '@nte/components/survey/survey-phsp-results';
import { SurveyPhspResultsCollegeComponent } from '@nte/components/survey/survey-phsp-results-college';
import { SurveyPhspScholarshipsComponent } from '@nte/components/survey/survey-phsp-scholarships';
import { SurveyPhspTableComponent } from '@nte/components/survey/survey-phsp-table';
import { PipesModule } from '@nte/pipes/pipes.module';

const components = [
  SurveyCcComponent,
  SurveyCustomComponent,
  SurveyIpComponent,
  SurveyPhspTableComponent,
  SurveyPhspResultsCollegeComponent,
  SurveyPhspResultsComponent,
  SurveyPhspCollegesComponent,
  SurveyPhspScholarshipsComponent,
  SurveyPhspComponent
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PipesModule,
    ComponentsModule
  ]
})
export class SurveyModule { }
