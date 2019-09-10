import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PipesModule } from '@nte/pipes/pipes.module';
import { CollegeApplicationPage } from './college-application';

@NgModule({
  declarations: [
    CollegeApplicationPage
  ],
  exports: [
    CollegeApplicationPage
  ],
  imports: [
    IonicPageModule.forChild(CollegeApplicationPage),
    PipesModule
  ]
})

export class CollegeApplicationPageModule {}
