import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegeApplicationPage } from './college-application';
import { PipesModule } from '@nte/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: CollegeApplicationPage
  }
];

@NgModule({
  declarations: [
    CollegeApplicationPage
  ],
  exports: [
    CollegeApplicationPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule
  ]
})

export class CollegeApplicationPageModule { }
