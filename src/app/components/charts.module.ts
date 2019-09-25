import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgApexchartsModule } from 'ng-apexcharts';

import { BarChartComponent } from '@nte/components/bar-chart/bar-chart';
import { PieChartComponent } from '@nte/components/pie-chart/pie-chart';
import { RadialChartComponent } from '@nte/components/radial-chart/radial-chart';

const components = [
  BarChartComponent,
  PieChartComponent,
  RadialChartComponent
];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    IonicModule,
    NgApexchartsModule
  ],
  exports: components,
  providers: [],
})
export class ChartsModule { }
