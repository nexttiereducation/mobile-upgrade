import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { FilterChecklistPage } from './filter-checklist';

@NgModule({
  declarations: [
    FilterChecklistPage
  ],
  exports: [
    FilterChecklistPage
  ],
  imports: [
    IonicPageModule.forChild(FilterChecklistPage)
  ]
})

export class FilterChecklistPageModule {}
