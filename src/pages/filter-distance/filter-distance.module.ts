import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FilterDistancePage } from './filter-distance';

@NgModule({
  declarations: [
    FilterDistancePage
  ],
  exports: [
    FilterDistancePage
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class FilterDistancePageModule { }
