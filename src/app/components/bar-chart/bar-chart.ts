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

  constructor() { }

  ngOnInit() {
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
    }
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: this.isHorizontal ? 'horizontalBar' : 'bar',
      data: {
        datasets: [
          {
            label: '%',
            data: this.values,
            backgroundColor: this.colors,
            hoverBackgroundColor: this.colors,
          }
        ],
        labels: this.labels
      },
      options: opts
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
