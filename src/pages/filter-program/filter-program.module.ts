import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { FilterProgramPage } from './filter-program';

@NgModule({
  declarations: [
    FilterProgramPage
  ],
  exports: [
    FilterProgramPage
  ],
  imports: [
    IonicPageModule.forChild(FilterProgramPage),
    ComponentsModule
  ]
})

export class FilterProgramPageModule {}
