import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { ScholarshipsListPageModule } from './../scholarships-list/scholarships-list.module';
import { ScholarshipsPage } from './scholarships';

@NgModule({
  declarations: [
    ScholarshipsPage
  ],
  exports: [
    ScholarshipsPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ScholarshipsPage),
    ScholarshipsListPageModule
  ]
})
export class ScholarshipsPageModule {}
