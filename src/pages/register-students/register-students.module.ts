import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RegisterStudentsPage } from './register-students';

@NgModule({
  declarations: [
    RegisterStudentsPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})

export class RegisterStudentsPageModule { }
