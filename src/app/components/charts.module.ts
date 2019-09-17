import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

import { PieChartComponent } from '@nte/components/pie-chart/pie-chart';
import { RadialChartComponent } from '@nte/components/radial-chart/radial-chart';

@NgModule({
  declarations: [
    PieChartComponent,
    RadialChartComponent
  ],
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  exports: [
    PieChartComponent,
    RadialChartComponent
  ],
  providers: [],
})
export class ChartsModule { }
