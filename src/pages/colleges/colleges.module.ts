import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegesListPageModule } from '@nte/pages/colleges-list/colleges-list.module';
import { CollegesPage } from '@nte/pages/colleges/colleges';

@NgModule({
  declarations: [
    CollegesPage
  ],
  exports: [
    CollegesPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollegesListPageModule,
    ComponentsModule
  ]
})
export class CollegesPageModule { }
