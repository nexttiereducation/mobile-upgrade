import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexLegend } from 'ng-apexcharts';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `pie-chart`,
  templateUrl: `pie-chart.html`,
  styleUrls: [`pie-chart.scss`]
})
export class PieChartComponent {
  @ViewChild(`pieChart`, { static: false }) pieChartElem;

  @Input() colors: any[];
  @Input() series: any;
  @Input() showLegend: boolean = false;
  @Input() size: string = `small`;
  @Input() subtitle: boolean = false;
  @Input() title?: string;
  @Input() unit: string = `student`;

  get chart(): ApexChart {
    return {
      height: 250,
      type: `pie`
    };
  }

  get dataLabels(): ApexDataLabels {
    return {
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45
      },
      enabled: this.showLegend,
      enabledOnSeries: this.showLegend,
      formatter: (val, opts) => `${Math.round(val)}%`,
      style: {
        fontSize: '14px',
        colors: ['#ffffff']
      }
    };
  }

  get labels() {
    return this.series.names;
  }

  get legend(): ApexLegend {
    return {
      fontSize: '14px',
      show: this.showLegend
    };
  }

  get values() {
    return this.series.values;
  }

  constructor() { }
}
