import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegeGeneralPage } from './college-general';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CollegeGeneralPage
  }
];

@NgModule({
  declarations: [
    CollegeGeneralPage
  ],
  exports: [
    CollegeGeneralPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})

export class CollegeGeneralPageModule { }
