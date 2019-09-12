import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ScholarshipsListPageModule } from './../scholarships-list/scholarships-list.module';
import { ScholarshipsPage } from './scholarships';
import { ComponentsModule } from '@nte/components/components.module';


@NgModule({
  declarations: [
    ScholarshipsPage
  ],
  exports: [
    ScholarshipsPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ScholarshipsListPageModule
  ]
})
export class ScholarshipsPageModule { }
