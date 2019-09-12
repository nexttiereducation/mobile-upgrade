import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ForgotPasswordPage } from './forgot-password';

const routes: Routes = [
  {
    path: 'forgot-password',
    component: ForgotPasswordPage
  }
];

@NgModule({
  declarations: [
    ForgotPasswordPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class ForgotPasswordPageModule { }
