import { NgModule } from '@angular/core';
import { IonicPageModule } from '@ionic/angular';

import { ComponentsModule } from '@nte/components/components.module';
import { RegisterSchoolPage } from './register-school';

@NgModule({
  declarations: [
    RegisterSchoolPage
  ],
  exports: [
    RegisterSchoolPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(RegisterSchoolPage)
  ]
})
export class RegisterSchoolPageModule {}
