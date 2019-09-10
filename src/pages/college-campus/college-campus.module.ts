import { NgModule } from '@angular/core';
import { GoogleMaps } from '@ionic-native/google-maps';
import { IonicPageModule } from 'ionic-angular';

import { ComponentsModule } from '@nte/components/components.module';
import { CollegeCampusPage } from './college-campus';

@NgModule({
  declarations: [
    CollegeCampusPage
  ],
  exports: [
    CollegeCampusPage
  ],
  imports: [
    IonicPageModule.forChild(CollegeCampusPage),
    ComponentsModule
  ],
  services: [
    GoogleMaps
  ]
})

export class CollegeCampusPageModule { }
