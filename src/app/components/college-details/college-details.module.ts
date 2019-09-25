import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChartsModule } from '@nte/components/charts.module';
import { CollegeAcademicComponent } from '@nte/components/college-details/academic/college-academic';
import { CollegeApplicationComponent } from '@nte/components/college-details/application/college-application';
import { CollegeCampusComponent } from '@nte/components/college-details/campus/college-campus';
import { CollegeFinancialComponent } from '@nte/components/college-details/financial/college-financial';
import { CollegeGeneralComponent } from '@nte/components/college-details/general/college-general';
import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';

const components = [
  CollegeGeneralComponent,
  CollegeAcademicComponent,
  CollegeFinancialComponent,
  CollegeCampusComponent,
  CollegeApplicationComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PipesModule,
    ChartsModule,
    AgmCoreModule
  ],
  exports: components,
  providers: [],
})
export class CollegeDetailsModule { }
