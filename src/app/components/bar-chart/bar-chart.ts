import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'bar-chart',
  templateUrl: 'bar-chart.html'
})
export class BarChartComponent implements OnInit {
  @ViewChild('barCanvas', { static: true }) barCanvas: ElementRef;

  @Input() colors: string[] = [
    '#0084CA',
    '#e0e0e0'
  ];
  @Input() height: number = 280;
  @Input() isHorizontal: boolean = false;
  @Input() isStacked: boolean = false;
  @Input() labels: string[];
  @Input() showLegend: boolean = false;
  @Input() values: number[];

  private barChart: Chart;

  get opts() {
    const opts: any = {
      legend: {
        display: false
      },
      responsive: true,
      animation: {
        animateScale: true,
        animateRotate: true
      }
    };
    if (this.isStacked) {
      opts.scales = {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          stacked: true
        }]
      };
      opts.plugins = {
        datalabels: {
          labels: {
            index: {
              align: this.showLegend ? 'start' : 'end',
              anchor: 'end',
              // color: (ctx) => {
              //   if (this.showLegend) {
              //     return labelColor;
              //   } else if (typeof ctx.dataset.backgroundColor === `string`) {
              //     return ctx.dataset.backgroundColor;
              //   }
              // },
              font: {
                weight: 600,
                size: 11
              },
              formatter: (val, ctx) => {
                const arr: any[] = ctx.dataset.data;
                return `${Math.round((arr[ctx.dataIndex] / this.total) * 100)}%`;
              },
              opacity: (ctx) => {
                const arr: any[] = ctx.dataset.data;
                return (Math.round((arr[ctx.dataIndex] / this.total) * 100) > 5) ? 1 : 0;
              },
              padding: 5
            },
            // name: {
            //   align: 'center',
            //   anchor: 'center',
            //   font: { size: 15 },
            //   formatter: (_val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            //   opacity: this.showLegend ? 0 : 1
            // },
            value: {
              align: 'bottom',
              anchor: 'center',
              color: `white`,
              font: { size: 13 },
              formatter: (val, ctx) => Math.round((val * 1000) / 1000).toLocaleString(),
              offset: 10,
              opacity: this.showLegend ? 0 : 0.6
            }
            // }
          }
        }
      };
    }
    return opts;
  }

  get total() {
    return this.values.reduce((total, val) => total + val);
  }

  constructor() { }

  ngOnInit() {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: this.isHorizontal ? 'horizontalBar' : 'bar',
      data: {
        datasets: [
          {
            backgroundColor: this.colors,
            data: this.values,
            hoverBackgroundColor: this.colors,
            label: '%'
          }
        ],
        labels: this.labels
      },
      options: this.opts
      //     labels: {
      //       boxWidth: 20,
      //       fontFamily: 'Roboto, Helvetica, sans-serif',
      //       usePointStyle: true
      //     }
      //   }
      // }
    });
  }
}
