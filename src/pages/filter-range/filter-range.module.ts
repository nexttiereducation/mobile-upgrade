import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FilterRangePage } from './filter-range';

@NgModule({
  declarations: [
    FilterRangePage
  ],
  exports: [
    FilterRangePage
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class FilterRangePageModule { }
