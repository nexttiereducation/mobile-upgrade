import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { PipesModule } from '@nte/pipes/pipes.module';
import { ScholarshipPage } from './scholarship';

@NgModule({
  declarations: [
    ScholarshipPage
  ],
  exports: [
    ScholarshipPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ScholarshipPage),
    PipesModule
  ]
})
export class ScholarshipPageModule {}
