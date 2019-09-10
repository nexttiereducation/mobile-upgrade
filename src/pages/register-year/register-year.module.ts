import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { RegisterYearPage } from './register-year';

@NgModule({
  declarations: [
    RegisterYearPage
  ],
  exports: [
    RegisterYearPage
  ],
  imports: [
    IonicPageModule.forChild(RegisterYearPage)
  ]
})
export class RegisterYearPageModule {}
