import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { FilterCategoryPage } from '@nte/pages/filter-category/filter-category';
import { FilterChecklistPageModule } from '@nte/pages/filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from '@nte/pages/filter-distance/filter-distance.module';
import { FilterProgramPageModule } from '@nte/pages/filter-program/filter-program.module';
import { FilterRangePageModule } from '@nte/pages/filter-range/filter-range.module';

@NgModule({
  declarations: [
    FilterCategoryPage
  ],
  exports: [
    FilterCategoryPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule
  ]
})

export class FilterCategoryPageModule { }
