import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegePage } from './college';

@NgModule({
  declarations: [
    CollegePage
  ],
  exports: [
    CollegePage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CollegePage)
  ]
})
export class CollegePageModule { }
