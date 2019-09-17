import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ChartsModule } from './../../app/components/charts.module';
import { CollegeAcademicPage } from './college-academic';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CollegeAcademicPage
  }
];

@NgModule({
  declarations: [
    CollegeAcademicPage
  ],
  exports: [
    CollegeAcademicPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    ChartsModule
  ]
})

export class CollegeAcademicPageModule { }
