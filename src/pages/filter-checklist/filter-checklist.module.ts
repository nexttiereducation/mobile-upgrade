import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { FilterChecklistPage } from './filter-checklist';

@NgModule({
  declarations: [
    FilterChecklistPage
  ],
  exports: [
    FilterChecklistPage
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class FilterChecklistPageModule { }
