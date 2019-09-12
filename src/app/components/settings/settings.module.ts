import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContactSettingsComponent } from '@nte/components/settings/settings-contact';
import { GeneralSettingsComponent } from '@nte/components/settings/settings-general';
import { NotificationSettingsComponent } from '@nte/components/settings/settings-notification';
import { PasswordSettingsComponent } from '@nte/components/settings/settings-password';

@NgModule({
  declarations: [
    ContactSettingsComponent,
    NotificationSettingsComponent,
    GeneralSettingsComponent,
    PasswordSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    ContactSettingsComponent,
    GeneralSettingsComponent,
    NotificationSettingsComponent,
    PasswordSettingsComponent
  ],
  providers: [],
})
export class SettingsModule { }
