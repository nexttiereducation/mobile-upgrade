import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LandingPage } from './landing';

const routes: Routes = [
  {
    path: 'landing',
    component: LandingPage
  }
];

@NgModule({
  declarations: [
    LandingPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class LandingPageModule { }
