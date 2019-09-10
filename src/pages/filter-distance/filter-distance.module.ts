import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { FilterDistancePage } from './filter-distance';

@NgModule({
  declarations: [
    FilterDistancePage
  ],
  exports: [
    FilterDistancePage
  ],
  imports: [
    IonicPageModule.forChild(FilterDistancePage)
  ]
})

export class FilterDistancePageModule {}
