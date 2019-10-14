import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { BarChartComponent } from '@nte/components/bar-chart/bar-chart';
import { PieChartComponent } from '@nte/components/pie-chart/pie-chart';
import { RadialChartComponent } from '@nte/components/radial-chart/radial-chart';
import { RangeChartComponent } from '@nte/components/range-chart/range-chart';

const components = [
  BarChartComponent,
  PieChartComponent,
  RadialChartComponent,
  RangeChartComponent,
];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: components,
  providers: []
})
export class ChartsModule { }
