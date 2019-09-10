import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { FilterCategoryPageModule } from './../category/category.module';
import { FilterChecklistPageModule } from './../filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from './../filter-distance/filter-distance.module';
import { FilterProgramPageModule } from './../filter-program/filter-program.module';
import { FilterRangePageModule } from './../filter-range/filter-range.module';
import { FilterPage } from './filter';

@NgModule({
  declarations: [
    FilterPage
  ],
  exports: [
    FilterPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(FilterPage),
    // added
    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule,
    FilterCategoryPageModule
  ]
})
export class FilterPageModule { }
