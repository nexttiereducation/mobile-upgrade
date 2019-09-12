import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile';
import { ComponentsModule } from '@nte/components/components.module';
import { SettingsModule } from '@nte/components/settings/settings.module';

@NgModule({
  declarations: [
    ProfilePage
  ],
  exports: [
    ProfilePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    SettingsModule
  ]
})

export class ProfilePageModule { }
