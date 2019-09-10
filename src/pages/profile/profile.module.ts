import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { ContactSettingsComponent } from '@nte/components/settings/settings-contact';
import { GeneralSettingsComponent } from '@nte/components/settings/settings-general';
import { NotificationSettingsComponent } from '@nte/components/settings/settings-notification';
import { PasswordSettingsComponent } from '@nte/components/settings/settings-password';
import { ProfilePage } from './profile';

@NgModule({
  declarations: [
    ProfilePage,
    GeneralSettingsComponent,
    ContactSettingsComponent,
    PasswordSettingsComponent,
    NotificationSettingsComponent
  ],
  exports: [
    ProfilePage
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    ComponentsModule
  ]
})

export class ProfilePageModule { }
