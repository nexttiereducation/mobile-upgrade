import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { IonicModule } from '@ionic/angular';

import { ChartsModule } from './../../app/components/charts.module';
import { CollegeCampusPage } from './college-campus';
import { ComponentsModule } from '@nte/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: CollegeCampusPage
  }
];

@NgModule({
  declarations: [
    CollegeCampusPage
  ],
  exports: [
    CollegeCampusPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    ChartsModule
  ],
  providers: [
    GoogleMaps
  ]
})

export class CollegeCampusPageModule { }
