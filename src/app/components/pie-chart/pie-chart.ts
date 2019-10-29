import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

import 'chartjs-plugin-datalabels';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `pie-chart`,
  templateUrl: `pie-chart.html`
})
export class PieChartComponent implements OnInit {
  @ViewChild('pieCanvas', { static: true }) pieCanvas: ElementRef;

  @Input() colors: any[];
  @Input() labels: string[];
  @Input() showLegend: boolean = false;
  @Input() size: string = `small`;
  @Input() subtitle: boolean = false;
  @Input() title?: string;
  @Input() unit: string = `student`;
  @Input() values: number[];

  private pieChart: Chart;

  get percents() {
    return [...this.values].map(v => Math.floor(v / this.total) * 100);
  }

  get total() {
    return [...this.values].reduce((a, b) => a + b, 0);
  }

  constructor() {
    Chart.defaults.global.defaultFontFamily = 'Roboto, Helvetica, sans-serif';
  }

  ngOnInit(): void {
    this.values = this.values.map(v => v ? v : 0);
    const chartConfig: ChartConfiguration = {
      type: 'pie',
      data: {
        datasets: [
          {
            // label: '# of Votes',
            backgroundColor: this.colors,
            data: this.values,
            hoverBackgroundColor: this.colors,
          }
        ],
        labels: this.labels
      },
      options: {
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        legend: {
          display: this.showLegend,
          labels: {},
          position: `right`
        },
        plugins: {
          datalabels: {}
        }
      }
    };
    if (this.showLegend) {
      if (chartConfig.data.datasets[0][`datalabels`]) {
        delete chartConfig.data.datasets[0][`datalabels`];
      }
      chartConfig.options.plugins.datalabels[`opacity`] = 0;
      chartConfig.options.legend.labels = {
        boxWidth: 20,
        usePointStyle: true
      };
    }
    // else {
    const labelColor: string = `white`;
    chartConfig.options.plugins.datalabels = {
      color: 'white',
      display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 10,
      font: { weight: 400 },
      offset: 0,
      padding: 0,
      // };
      // chartConfig.data.datasets[0][`datalabels`] = {
      labels: {
        index: {
          color: (ctx) => {
            if (this.showLegend) {
              return labelColor;
            } else if (typeof ctx.dataset.backgroundColor === `string`) {
              return ctx.dataset.backgroundColor;
            }
          },
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
        name: {
          align: 'center',
          anchor: 'center',
          font: { size: 15 },
          formatter: (_val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
          opacity: this.showLegend ? 0 : 1
        },
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
    };
    if (!this.showLegend) {
      chartConfig.options.plugins.datalabels.labels.index.align = 'end';
      chartConfig.options.plugins.datalabels.labels.index.anchor = 'end';
    }
    this.pieChart = new Chart(this.pieCanvas.nativeElement, chartConfig);
    const legendHtml = this.pieChart.generateLegend();
    console.log(legendHtml);
  }
}
