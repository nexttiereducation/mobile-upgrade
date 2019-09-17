import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ChartComponent
} from 'ng-apexcharts';

@Component({
  selector: 'radial-chart',
  templateUrl: './radial-chart.html'
})
export class RadialChartComponent implements OnInit {
  @ViewChild('chart', { static: false }) chartEl: ChartComponent;

  @Input() color: string;
  @Input() colors: string[] = ['#20E647'];
  @Input() height: number = 280;
  @Input() label: string = 'Progress';
  @Input() value: number;

  get chart(): ApexChart {
    return {
      height: this.height,
      type: 'radialBar',
    };
  }

  get series(): ApexNonAxisChartSeries {
    if (this.value) {
      return [this.value];
    }
  }

  get plotOptions(): ApexPlotOptions {
    return {
      radialBar: {
        hollow: {
          margin: 0,
          size: '70%'
        },
        track: {
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        dataLabels: {
          name: {
            color: '#AAA',
            offsetY: -20,
            fontSize: '13px'
          },
          show: true,
          value: {
            fontSize: '50px',
            show: true
          }
        }
      }
    };
  }

  get fill(): ApexFill {
    return {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        gradientToColors: ['#87D4F9'],
        stops: [0, 100]
      }
    };
  }

  get labels() {
    if (this.label) {
      return [this.label];
    }
  }

  get stroke(): ApexStroke {
    return {
      lineCap: 'round'
    };
  }


  constructor() { }

  ngOnInit() {
    if (this.color && this.color !== this.colors[0]) {
      this.colors = [this.color];
    }
  }
}
