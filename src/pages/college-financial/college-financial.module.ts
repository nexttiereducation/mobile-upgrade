import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { CollegeFinancialPage } from './college-financial';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CollegeFinancialPage
  }
];

@NgModule({
  declarations: [
    CollegeFinancialPage
  ],
  exports: [
    CollegeFinancialPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})

export class CollegeFinancialPageModule { }
