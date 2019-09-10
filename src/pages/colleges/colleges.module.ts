import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegesListPageModule } from './../colleges-list/colleges-list.module';
import { CollegesPage } from './colleges';

@NgModule({
  declarations: [
    CollegesPage
  ],
  exports: [
    CollegesPage
  ],
  imports: [
    IonicPageModule.forChild(CollegesPage),
    CollegesListPageModule,
    ComponentsModule
  ]
})
export class CollegesPageModule {}
