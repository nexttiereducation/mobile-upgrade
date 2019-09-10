import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegeAcademicPage } from './college-academic';

@NgModule({
  declarations: [
    CollegeAcademicPage
  ],
  exports: [
    CollegeAcademicPage
  ],
  imports: [
    IonicPageModule.forChild(CollegeAcademicPage),
    ComponentsModule
  ]
})

export class CollegeAcademicPageModule {}
