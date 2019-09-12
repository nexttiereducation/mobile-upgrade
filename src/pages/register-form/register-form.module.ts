import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { RegisterFormPage } from './register-form';

const routes: Routes = [
  {
    path: 'register/form',
    component: RegisterFormPage
  }
];

@NgModule({
  declarations: [
    RegisterFormPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class RegisterFormPageModule { }
