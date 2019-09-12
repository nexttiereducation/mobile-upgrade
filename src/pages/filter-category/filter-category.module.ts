import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FilterCategoryPage } from './filter-category';
import { ComponentsModule } from '@nte/components/components.module';

import { FilterChecklistPageModule } from '../filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from '../filter-distance/filter-distance.module';
import { FilterProgramPageModule } from '../filter-program/filter-program.module';
import { FilterRangePageModule } from '../filter-range/filter-range.module';

@NgModule({
  declarations: [
    FilterCategoryPage
  ],
  exports: [
    FilterCategoryPage
  ],
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule
  ]
})

export class FilterCategoryPageModule { }
