import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { RegisterSchoolPage } from './register-school';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: 'register/school',
    component: RegisterSchoolPage
  }
];

@NgModule({
  declarations: [
    RegisterSchoolPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ]
})
export class RegisterSchoolPageModule { }
