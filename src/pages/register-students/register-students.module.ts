import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { RegisterStudentsPage } from './register-students';

@NgModule({
  declarations: [
    RegisterStudentsPage
  ],
  imports: [
    IonicPageModule.forChild(RegisterStudentsPage)
  ]
})

export class RegisterStudentsPageModule {}
