import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { FilterChecklistPageModule } from './../filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from './../filter-distance/filter-distance.module';
import { FilterProgramPageModule } from './../filter-program/filter-program.module';
import { FilterRangePageModule } from './../filter-range/filter-range.module';
import { FilterCategoryPage } from './category';

@NgModule({
  declarations: [
    FilterCategoryPage
  ],
  exports: [
    FilterCategoryPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(FilterCategoryPage),
    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule
  ]
})

export class FilterCategoryPageModule { }
