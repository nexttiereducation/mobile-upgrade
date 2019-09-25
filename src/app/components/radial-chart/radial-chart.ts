import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

import 'chartjs-plugin-doughnutlabel';

@Component({
  selector: 'radial-chart',
  templateUrl: 'radial-chart.html'
})
export class RadialChartComponent implements OnInit {
  @ViewChild('doughnutCanvas', { static: true }) doughnutCanvas: ElementRef;

  @Input() color: string;
  @Input() colors: string[] = [
    '#0084CA',
    '#e0e0e0'
  ];
  @Input() height: number = 280;
  @Input() label: string = 'Progress';
  @Input() value: string | number;

  private doughnutChart: Chart;

  constructor() { }

  ngOnInit() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: '%',
            data: [
              +this.value,
              100 - +this.value
            ],
            backgroundColor: this.colors,
            hoverBackgroundColor: this.colors,
          }
        ],
        labels: [
          this.label,
          'Other'
        ]
      },
      options: {
        cutoutPercentage: 70,
        legend: {
          display: false
        },
        responsive: true,
        title: {
          display: true,
          fontFamily: 'Roboto, Helvetica, sans-serif',
          fontSize: 14,
          text: this.label
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        plugins: {
          doughnutlabel: {
            labels: [
              {
                text: `${this.value}%`,
                font: {
                  size: '60'
                }
              }
            ]
          }
        }
      }
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
