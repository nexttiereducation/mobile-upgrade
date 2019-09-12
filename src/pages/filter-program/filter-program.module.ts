import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FilterProgramPage } from './filter-program';
import { ComponentsModule } from '@nte/components/components.module';

@NgModule({
  declarations: [
    FilterProgramPage
  ],
  exports: [
    FilterProgramPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule
  ]
})

export class FilterProgramPageModule { }
