import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegeFinancialPage } from './college-financial';

@NgModule({
  declarations: [
    CollegeFinancialPage
  ],
  exports: [
    CollegeFinancialPage
  ],
  imports: [
    IonicPageModule.forChild(CollegeFinancialPage),
    ComponentsModule
  ]
})

export class CollegeFinancialPageModule {}
