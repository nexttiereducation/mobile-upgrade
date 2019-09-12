import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FilterPage } from './filter';
import { ComponentsModule } from '@nte/components/components.module';
import { FilterCategoryPageModule } from '@nte/pages/filter-category/filter-category.module';
import { FilterChecklistPageModule } from '@nte/pages/filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from '@nte/pages/filter-distance/filter-distance.module';
import { FilterProgramPageModule } from '@nte/pages/filter-program/filter-program.module';
import { FilterRangePageModule } from '@nte/pages/filter-range/filter-range.module';

@NgModule({
  declarations: [
    FilterPage
  ],
  exports: [
    FilterPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    // added
    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule,
    FilterCategoryPageModule
  ]
})
export class FilterPageModule { }
