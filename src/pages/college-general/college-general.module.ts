import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegeGeneralPage } from './college-general';

@NgModule({
  declarations: [
    CollegeGeneralPage
  ],
  exports: [
    CollegeGeneralPage
  ],
  imports: [
    IonicPageModule.forChild(CollegeGeneralPage),
    ComponentsModule
  ]
})

export class CollegeGeneralPageModule {}
