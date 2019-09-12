import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { RegisterYearPage } from './register-year';

const routes: Routes = [
  {
    path: 'register/year',
    component: RegisterYearPage
  }
];

@NgModule({
  declarations: [
    RegisterYearPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forRoot(routes)
  ]
})
export class RegisterYearPageModule { }
