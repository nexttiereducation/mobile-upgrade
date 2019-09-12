import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPage
  }
];

@NgModule({
  declarations: [
    LoginPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})

export class LoginPageModule { }
